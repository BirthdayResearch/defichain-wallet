import { translate } from '@translations'
import { CTransactionSegWit, PlaceAuctionBid } from '@defichain/jellyfish-transaction/dist'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { hasTxQueued, transactionQueue } from '@store/transaction_queue'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@store'
import { firstTransactionSelector, hasTxQueued as hasBroadcastQueued, OceanTransaction } from '@store/ocean'

interface ConstructSignedBidAndSendProps {
  vaultId: PlaceAuctionBid['vaultId']
  index: PlaceAuctionBid['index']
  tokenAmount: PlaceAuctionBid['tokenAmount']
  displaySymbol: string
  onBroadcast: () => void
}

export const useSignBidAndSend = (): {
  hasPendingJob: boolean
  hasPendingBroadcastJob: boolean
  currentBroadcastJob: OceanTransaction
  constructSignedBidAndSend: (props: ConstructSignedBidAndSendProps) => Promise<void>
} => {
  const dispatch = useDispatch()
  const logger = useLogger()
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const currentBroadcastJob = useSelector((state: RootState) => firstTransactionSelector(state.ocean))

  async function constructSignedBidAndSend (props: ConstructSignedBidAndSendProps): Promise<void> {
      try {
        const signer = async (account: WhaleWalletAccount): Promise<CTransactionSegWit> => {
          const builder = account.withTransactionBuilder()
          const script = await account.getScript()
          const bid: PlaceAuctionBid = {
            from: script,
            vaultId: props.vaultId,
            index: props.index,
            tokenAmount: {
              token: Number(props.tokenAmount.token),
              amount: props.tokenAmount.amount
            }
          }
          const dfTx = await builder.loans.placeAuctionBid(bid, script)

          return new CTransactionSegWit(dfTx)
        }

        dispatch(transactionQueue.actions.push({
          sign: signer,
          title: translate('screens/PlaceBidScreen', 'Sign Transaction'),
          description: translate('screens/PlaceBidScreen', 'Placing {{amount}} {{token}} as bid for auction.', {
            amount: props.tokenAmount.amount,
            token: props.displaySymbol
          }),
          onBroadcast: props.onBroadcast
        }))
      } catch (e) {
        logger.error(e)
      }
    }

    return {
      hasPendingJob,
      hasPendingBroadcastJob,
      currentBroadcastJob,
      constructSignedBidAndSend
    }
}
