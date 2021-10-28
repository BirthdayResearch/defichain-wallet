import { useEffect } from 'react'
import { Dispatch } from 'redux'
import { useDispatch, useSelector } from 'react-redux'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { RootState } from '@store'
import { loans, LoanVault } from '@store/loans'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { useLogger, NativeLoggingProps } from '@shared-contexts/NativeLoggingProvider'

export function fetchVaults (client: WhaleApiClient, address: string, dispatch: Dispatch<any>, logger: NativeLoggingProps): void {
  // @ts-expect-error
  client.loan.listVaults(address).then((vaults: LoanVault[]) => {
    dispatch(loans.actions.setVaults(vaults))
  }).catch(logger.error)
}

export function useVaultsAPI (): LoanVault[] {
  const client = useWhaleApiClient()
  const logger = useLogger()
  const vaults = useSelector((state: RootState) => state.loans.vaults)
  const blocks = useSelector((state: RootState) => state.block.count)
  const { address } = useWalletContext()
  const dispatch = useDispatch()

  useEffect(() => {
    fetchVaults(client, address, dispatch, logger)
  }, [address, blocks])
  return vaults
}
