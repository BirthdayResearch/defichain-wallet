import { useEffect } from 'react'
import { Dispatch } from 'redux'
import { useDispatch, useSelector } from 'react-redux'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { RootState } from '@store'
import { CollateralToken, loans } from '@store/loans'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { useLogger, NativeLoggingProps } from '@shared-contexts/NativeLoggingProvider'

export function fetchCollateralTokens (client: WhaleApiClient, dispatch: Dispatch<any>, logger: NativeLoggingProps): void {
  // @ts-expect-error
  client.loan.listCollateralToken(50).then((tokens: CollateralToken[]) => {
    dispatch(loans.actions.setCollateralTokens(tokens))
  }).catch(logger.error)
}

export function useCollateralTokensAPI (): CollateralToken[] {
  const client = useWhaleApiClient()
  const logger = useLogger()
  const collateralTokens = useSelector((state: RootState) => state.loans.collateralTokens)
  const blocks = useSelector((state: RootState) => state.block.count)
  const { address } = useWalletContext()
  const dispatch = useDispatch()

  useEffect(() => {
    fetchCollateralTokens(client, dispatch, logger)
  }, [address, blocks])
  return collateralTokens
}
