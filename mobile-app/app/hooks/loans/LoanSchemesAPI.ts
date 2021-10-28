import { useEffect } from 'react'
import { Dispatch } from 'redux'
import { useDispatch, useSelector } from 'react-redux'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { RootState } from '@store'
import { loans, LoanScheme } from '@store/loans'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { useLogger, NativeLoggingProps } from '@shared-contexts/NativeLoggingProvider'

export function fetchLoanSchemes (client: WhaleApiClient, dispatch: Dispatch<any>, logger: NativeLoggingProps): void {
  client.loan.listScheme(50).then((loanSchemes: LoanScheme[]) => {
    dispatch(loans.actions.setLoanSchemes(loanSchemes))
  }).catch(logger.error)
}

export function useLoanSchemeAPI (): LoanScheme[] {
  const client = useWhaleApiClient()
  const logger = useLogger()
  const loanSchemes = useSelector((state: RootState) => state.loans.loanSchemes)
  const blocks = useSelector((state: RootState) => state.block.count)
  const { address } = useWalletContext()
  const dispatch = useDispatch()

  useEffect(() => {
    fetchLoanSchemes(client, dispatch, logger)
  }, [address, blocks])
  return loanSchemes
}
