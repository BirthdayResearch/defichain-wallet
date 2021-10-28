import { useEffect } from 'react'
import { Dispatch } from 'redux'
import { useDispatch, useSelector } from 'react-redux'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { RootState } from '@store'
import { loans, LoanToken } from '@store/loans'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { useLogger, NativeLoggingProps } from '@shared-contexts/NativeLoggingProvider'

export function fetchLoanTokens (client: WhaleApiClient, dispatch: Dispatch<any>, logger: NativeLoggingProps): void {
  // @ts-expect-error
  client.loan.listLoanToken(50).then((vaults: LoanToken[]) => {
    dispatch(loans.actions.setLoanTokens(vaults))
  }).catch(logger.error)
}

export function useLoanTokensAPI (): LoanToken[] {
  const client = useWhaleApiClient()
  const logger = useLogger()
  const loanTokens = useSelector((state: RootState) => state.loans.loanTokens)
  const blocks = useSelector((state: RootState) => state.block.count)
  const { address } = useWalletContext()
  const dispatch = useDispatch()

  useEffect(() => {
    fetchLoanTokens(client, dispatch, logger)
  }, [address, blocks])
  return loanTokens
}
