import { useEffect } from 'react'
import { Dispatch } from 'redux'
import { useDispatch, useSelector } from 'react-redux'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { RootState } from '@store'
import { AuctionDetail, loans } from '@store/loans'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { useLogger, NativeLoggingProps } from '@shared-contexts/NativeLoggingProvider'

export function fetchAuctions (client: WhaleApiClient, dispatch: Dispatch<any>, logger: NativeLoggingProps): void {
  // @ts-expect-error
  client.loan.listAuctions(50).then((vaults: AuctionDetail[]) => {
    dispatch(loans.actions.setAuctions(vaults))
  }).catch(logger.error)
}

export function useAuctionsAPI (): AuctionDetail[] {
  const client = useWhaleApiClient()
  const logger = useLogger()
  const auctions = useSelector((state: RootState) => state.loans.auctions)
  const blocks = useSelector((state: RootState) => state.block.count)
  const { address } = useWalletContext()
  const dispatch = useDispatch()

  useEffect(() => {
    fetchAuctions(client, dispatch, logger)
  }, [address, blocks])
  return auctions
}
