import { WhaleApiClient } from '@defichain/whale-api-client'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch } from 'redux'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { RootState } from '@store'
import { tokensSelector, wallet, WalletToken } from '@store/wallet'
import { useLogger, NativeLoggingProps } from '@shared-contexts/NativeLoggingProvider'

/**
 * @deprecated need to refactor this
 */
export function fetchTokens (client: WhaleApiClient, address: string, dispatch: Dispatch<any>, logger: NativeLoggingProps): void {
  client.address.listToken(address, 200).then((walletTokens) => {
    dispatch(wallet.actions.setTokens(walletTokens))
  }).catch(logger.error)

  client.address.getBalance(address).then((walletBalance) => {
    dispatch(wallet.actions.setUtxoBalance(walletBalance))
  }).catch(logger.error)
}

/**
 * @deprecated need to refactor this
 */
export function useTokensAPI (): WalletToken[] {
  const client = useWhaleApiClient()
  const logger = useLogger()
  const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))
  const blocks = useSelector((state: RootState) => state.block.count)
  const { address } = useWalletContext()
  const dispatch = useDispatch()

  useEffect(() => {
    fetchTokens(client, address, dispatch, logger)
  }, [address, blocks])
  return tokens
}
