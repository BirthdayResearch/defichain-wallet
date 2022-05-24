import { Dispatch, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { RootState } from '@store'
import { hasTxQueued, transactionQueue } from '@store/transaction_queue'
import { firstTransactionSelector, hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { onTransactionBroadcast } from '@api/transaction/transaction_commands'
import { CTransactionSegWit, PlaceAuctionBid } from '@defichain/jellyfish-transaction/dist'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { NativeLoggingProps, useLogger } from '@shared-contexts/NativeLoggingProvider'
import { SubmitButtonGroup } from '@components/SubmitButtonGroup'
import { TextRow } from '@components/TextRow'
import { NumberRow } from '@components/NumberRow'
import { FeeInfoRow } from '@components/FeeInfoRow'
import { ThemedScrollView, ThemedSectionTitle } from '@components/themed'
import { AuctionsParamList } from '../AuctionNavigator'
import { WalletAddressRow } from '@components/WalletAddressRow'

type Props = StackScreenProps<AuctionsParamList, 'ConfirmPlaceBidScreen'>

export function ConfirmPlaceBidScreen (props: Props): JSX.Element {
  const navigation = useNavigation<NavigationProp<AuctionsParamList>>()
  const dispatch = useDispatch()
  const logger = useLogger()
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const currentBroadcastJob = useSelector((state: RootState) => firstTransactionSelector(state.ocean))
  const {
    bidAmount,
    estimatedFees,
    totalAuctionValue,
    vault,
    batch
  } = props.route.params

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOnPage, setIsOnPage] = useState(true)

  useEffect(() => {
    setIsOnPage(true)
    return () => {
      setIsOnPage(false)
    }
  }, [])

  async function onSubmit (): Promise<void> {
    if (hasPendingJob || hasPendingBroadcastJob) {
      return
    }

    setIsSubmitting(true)
    await constructSignedBidAndSend(
      vault.vaultId,
      batch.index,
      {
        amount: bidAmount,
        token: Number(batch.loan.id)
      },
      batch.loan.displaySymbol,
      dispatch, () => {
        onTransactionBroadcast(isOnPage, navigation.dispatch)
      }, logger)
    setIsSubmitting(false)
  }

  function onCancel (): void {
    if (!isSubmitting) {
      navigation.navigate({
        name: 'PlaceBidScreen',
        params: {
          batch,
          vault
        },
        merge: true
      })
    }
  }

  function getSubmitLabel (): string {
    if (!hasPendingBroadcastJob && !hasPendingJob) {
      return 'CONFIRM BID'
    }
    if (hasPendingBroadcastJob && currentBroadcastJob !== undefined && currentBroadcastJob.submitButtonLabel !== undefined) {
      return currentBroadcastJob.submitButtonLabel
    }
    return 'PLACING BID'
  }

  return (
    <ThemedScrollView
      testID='confirm_place_bid_screen'
      contentContainerStyle={tailwind('py-6 pb-8')}
    >
      <ThemedSectionTitle
        testID='title_tx_detail'
        text={translate('screens/ConfirmPlaceBidScreen', 'TRANSACTION DETAILS')}
      />
      <TextRow
        lhs={translate('screens/ConfirmPlaceBidScreen', 'Transaction type')}
        rhs={{
          value: translate('screens/ConfirmPlaceBidScreen', 'Place bid'),
          testID: 'text_transaction_type'
        }}
        textStyle={tailwind('text-sm font-normal')}
      />
      <WalletAddressRow />
      <NumberRow
        lhs={translate('screens/ConfirmPlaceBidScreen', 'Bid amount to place')}
        rhs={{
          testID: 'estimated_to_receive',
          value: bidAmount.toFixed(8),
          suffixType: 'text',
          suffix: batch.loan.displaySymbol
        }}
      />
      <FeeInfoRow
        type='ESTIMATED_FEE'
        value={estimatedFees.toFixed(8)}
        testID='text_fee'
        suffix='DFI'
      />

      <ThemedSectionTitle
        testID='title_auction_detail'
        text={translate('screens/ConfirmPlaceBidScreen', 'AUCTION DETAILS')}
      />
      <NumberRow
        lhs={translate('screens/ConfirmPlaceBidScreen', 'Total auction value (USD)')}
        rhs={{
          testID: 'total_auction_value',
          value: totalAuctionValue,
          suffixType: 'text',
          prefix: '$'
        }}
      />
      <TextRow
        lhs={translate('screens/ConfirmPlaceBidScreen', 'Vault ID')}
        rhs={{
          value: vault.vaultId,
          testID: 'text_vault_id',
          numberOfLines: 1,
          ellipsizeMode: 'middle'
        }}
        textStyle={tailwind('text-sm font-normal')}
      />
      <TextRow
        lhs={translate('screens/ConfirmPlaceBidScreen', 'Vault owner ID')}
        rhs={{
          value: vault.ownerAddress,
          testID: 'text_vault_owner_id'
        }}
        textStyle={tailwind('text-sm font-normal')}
      />
      <NumberRow
        lhs={translate('screens/ConfirmPlaceBidScreen', 'Liquidation Height')}
        rhs={{
          testID: 'text_liquidation_height',
          value: vault.liquidationHeight
        }}
      />

      <SubmitButtonGroup
        label={translate('screens/ConfirmPlaceBidScreen', 'CONFIRM PLACE BID')}
        isDisabled={isSubmitting || hasPendingJob || hasPendingBroadcastJob}
        isProcessing={isSubmitting || hasPendingJob || hasPendingBroadcastJob}
        processingLabel={translate('screens/ConfirmPlaceBidScreen', getSubmitLabel())}
        onCancel={onCancel}
        displayCancelBtn
        onSubmit={onSubmit}
        title='bid'
      />
    </ThemedScrollView>
  )
}

async function constructSignedBidAndSend (
  vaultId: PlaceAuctionBid['vaultId'],
  index: PlaceAuctionBid['index'],
  tokenAmount: PlaceAuctionBid['tokenAmount'],
  displaySymbol: string,
  dispatch: Dispatch<any>,
  onBroadcast: () => void,
  logger: NativeLoggingProps
): Promise<void> {
  try {
    const signer = async (account: WhaleWalletAccount): Promise<CTransactionSegWit> => {
      const builder = account.withTransactionBuilder()
      const script = await account.getScript()
      const bid: PlaceAuctionBid = {
        from: script,
        vaultId,
        index,
        tokenAmount
      }
      const dfTx = await builder.loans.placeAuctionBid(bid, script)

      return new CTransactionSegWit(dfTx)
    }

    dispatch(transactionQueue.actions.push({
      sign: signer,
      title: translate('screens/PlaceBidScreen', 'Sign Transaction'),
      description: translate('screens/PlaceBidScreen', 'Placing {{amount}} {{token}} as bid for auction.', {
        amount: tokenAmount.amount,
        token: displaySymbol
      }),
      onBroadcast
    }))
  } catch (e) {
    logger.error(e)
  }
}
