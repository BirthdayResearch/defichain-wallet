import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import BigNumber from 'bignumber.js'
import { RootState } from '@store'
import { DexItem, fetchSwappableTokens, tokensSelector } from '@store/wallet'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { BottomSheetToken } from '@components/BottomSheetTokenList'
import { TokenState } from '../CompositeSwap/CompositeSwapScreen'

interface TokenPrice {
    toTokens: BottomSheetToken[]
    fromTokens: BottomSheetToken[]
}
export function useSwappableTokens (fromTokenId: string | undefined): TokenPrice {
    const client = useWhaleApiClient()
    const dispatch = useDispatch()
    const blockCount = useSelector((state: RootState) => state.block.count)
    const { swappableTokens, poolpairs } = useSelector((state: RootState) => state.wallet)
    const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))

    const _allTokens = useMemo(() => {
        return poolpairs.reduce((tokensInPair: TokenState[], pair: DexItem): TokenState[] => {
            const hasTokenA = tokensInPair.some(token => pair.data.tokenA.id === token.id)
            const hasTokenB = tokensInPair.some(token => pair.data.tokenB.id === token.id)
            const tokensToAdd: TokenState[] = []
            if (!hasTokenA) {
                tokensToAdd.push(pair.data.tokenA)
            }
            if (!hasTokenB) {
                tokensToAdd.push(pair.data.tokenB)
            }

            return [...tokensInPair, ...tokensToAdd]
        }, [])
    }, [poolpairs])

    const toTokens = useMemo(() => {
        const swappableToTokens = swappableTokens[fromTokenId === '0_unified' ? '0' : fromTokenId ?? '']
        if (swappableToTokens === undefined) {
            return []
        }

        const toTokens: BottomSheetToken[] = swappableToTokens.swappableTokens
            .map((token) => {
                const tokenId = token.id === '0' ? '0_unified' : token.id
                const tokenData = _allTokens.find(t => t.id === token.id)

                return {
                    tokenId: tokenId,
                    available: new BigNumber(tokenData?.reserve ?? NaN),
                    token: {
                        displaySymbol: token.displaySymbol,
                        name: '', // not available in API,
                        symbol: token.symbol
                    },
                    reserve: tokenData?.reserve ?? '' // TODO(PIERRE): Ask whale to add reserve on response
                }
            })

        return toTokens
    }, [swappableTokens, fromTokenId])

    const fromTokens = useMemo(() => {
        const swappableFromTokens: BottomSheetToken[] = _allTokens
            .map((token) => {
                const tokenId = token.id === '0' ? '0_unified' : token.id
                const ownedToken = tokens.find(t => t.id === tokenId)
                return {
                    tokenId: tokenId,
                    available: new BigNumber(ownedToken === undefined ? 0 : ownedToken.amount),
                    token: {
                        displaySymbol: token.displaySymbol,
                        name: '', // not available in API,
                        symbol: token.symbol
                    },
                    reserve: token.reserve
                }
            }).sort((a, b) => b.available.minus(a.available).toNumber())

        return swappableFromTokens
    }, [poolpairs])

    useEffect(() => {
        if (fromTokenId !== undefined) {
            dispatch(fetchSwappableTokens({
                client, fromTokenId: fromTokenId === '0_unified' ? '0' : fromTokenId
            }))
        }
    }, [blockCount, fromTokenId])

    return {
        toTokens,
        fromTokens
    }
}
