import { useEffect, useState } from 'react'
import { Platform, View, NativeSyntheticEvent, TextInputChangeEventData, TouchableOpacity } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { StackScreenProps } from '@react-navigation/stack'
import { NavigationProp, useIsFocused, useNavigation } from '@react-navigation/native'
import BigNumber from 'bignumber.js'
import { tailwind } from '@tailwind'
import { RootState } from '@store'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { hasTxQueued } from '@store/transaction_queue'
import { translate } from '@translations'
import { useBottomSheet } from '@hooks/useBottomSheet'
import { FeeInfoRow } from '@components/FeeInfoRow'
import { ThemedScrollView, ThemedSectionTitle, ThemedText, ThemedView } from '@components/themed'
import { SetAmountButton, AmountButtonTypes } from '@components/SetAmountButton'
import { WalletTextInput } from '@components/WalletTextInput'
import { InputHelperText } from '@components/InputHelperText'
import { Button } from '@components/Button'
import { SymbolIcon } from '@components/SymbolIcon'
import { AuctionTimeProgress } from '../components/AuctionTimeProgress'
import { AuctionsParamList } from '../AuctionNavigator'
import { CollateralTokenIconGroup } from '../components/CollateralTokenIconGroup'
import { useAuctionBidValue } from '../hooks/AuctionBidValue'
import { useAuctionTime } from '../hooks/AuctionTimeLeft'
import { BottomSheetAuctionedCollateral } from '../components/BottomSheetAuctionedCollateral'
import { BottomSheetWebWithNav, BottomSheetWithNav } from '@components/BottomSheetWithNav'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { InfoText } from '@components/InfoText'
import { getActivePrice } from '@screens/AppNavigator/screens/Auctions/helpers/ActivePrice'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { fetchTokens, tokensSelector } from '@store/wallet'
import { VaultSectionTextRow } from '../../Loans/components/VaultSectionTextRow'
import { getUSDPrecisedPrice } from '@screens/AppNavigator/screens/Auctions/helpers/usd-precision'
import { ActiveUSDValue } from '../../Loans/VaultDetail/components/ActiveUSDValue'

type Props = StackScreenProps<AuctionsParamList, 'PlaceBidScreen'>

export function PlaceBidScreen (props: Props): JSX.Element {
  const {
    batch,
    vault
  } = props.route.params
  const dispatch = useDispatch()
  const { address } = useWalletContext()
  const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))
  const ownedToken = tokens.find(token => token.id === batch.loan.id)
  const {
    minNextBidInToken,
    totalCollateralsValueInUSD,
    minNextBidInUSD
  } = useAuctionBidValue(batch, vault.liquidationPenalty)
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001))
  const {
    bottomSheetRef,
    containerRef,
    dismissModal,
    expandModal,
    isModalDisplayed,
    bottomSheetScreen,
    setBottomSheetScreen
  } = useBottomSheet()

  const navigation = useNavigation<NavigationProp<AuctionsParamList>>()
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const blockCount = useSelector((state: RootState) => state.block.count) ?? 0
  const { blocksRemaining } = useAuctionTime(vault.liquidationHeight, blockCount)
  const logger = useLogger()
  const client = useWhaleApiClient()
  const isFocused = useIsFocused()

  const [bidAmount, setBidAmount] = useState<string>('')

  useEffect(() => {
    if (isFocused) {
      dispatch(fetchTokens({ client, address }))
    }
  }, [address, blockCount, isFocused])

  useEffect(() => {
    client.fee.estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(logger.error)
  }, [])

  const onBidMinAmount = (val: string): void => {
    setBidAmount(val)
  }

  const onPressFullDetails = (): void => {
    setBottomSheetScreen([{
      stackScreenName: 'Collateral for auction',
      option: {
        header: () => null,
        headerBackTitleVisible: false
      },
      component: BottomSheetAuctionedCollateral({
        collaterals: batch.collaterals,
        headerLabel: translate('screens/PlaceBidScreen', 'Collateral for auction'),
        onCloseButtonPress: dismissModal
      })
    }])
    expandModal()
  }

  const onSubmit = async (): Promise<void> => {
    if (hasPendingJob || hasPendingBroadcastJob) {
      return
    }

    navigation.navigate('ConfirmPlaceBidScreen', {
      batch,
      bidAmount: new BigNumber(bidAmount),
      estimatedFees: fee,
      totalAuctionValue: totalCollateralsValueInUSD,
      vault
    })
  }

  const ownedTokenAmount = ownedToken === undefined ? '0' : ownedToken.amount
  const isValidMinBid = new BigNumber(bidAmount).gte(minNextBidInToken)
  const hasSufficientFunds = new BigNumber(ownedTokenAmount).gte(minNextBidInToken)
  const displayHigherBidWarning = new BigNumber(bidAmount)
                                  .multipliedBy(getActivePrice(batch.loan.symbol, batch.loan.activePrice))
                                  .gte(new BigNumber(totalCollateralsValueInUSD).times(1.2))
  return (
    <View ref={containerRef} style={tailwind('h-full')}>
      <ThemedScrollView
        testID='place_bid_screen'
        contentContainerStyle={tailwind('flex flex-col justify-between py-6 pb-8 px-4 h-full')}
      >
        <View>
          <BidSummaryCard
            displaySymbol={batch.loan.displaySymbol}
            collateralDisplaySymbols={batch.collaterals.map(collateral => collateral.displaySymbol)}
            blockCount={blockCount}
            liquidationHeight={vault.liquidationHeight}
            minNextBid={minNextBidInToken}
            minNextBidInUSD={minNextBidInUSD}
            totalAuctionValue={totalCollateralsValueInUSD}
            onPressFullDetails={onPressFullDetails}
          />

          <WalletTextInput
            autoCapitalize='none'
            onChange={(e: NativeSyntheticEvent<TextInputChangeEventData>) => {
              onBidMinAmount(e.nativeEvent.text)
            }}
            title={translate('screens/PlaceBidScreen', 'How much do you want to bid?')}
            placeholder={translate('screens/PlaceBidScreen', 'Enter an amount')}
            style={tailwind('flex-grow w-2/5')}
            value={bidAmount}
            displayClearButton={new BigNumber(bidAmount).gte('0.00')}
            onClearButtonPress={() => onBidMinAmount('')}
            inputType='numeric'
            valid={bidAmount === '' || (hasSufficientFunds && isValidMinBid)}
            inlineText={{
              type: 'error',
              text: bidAmount === '' || (hasSufficientFunds && isValidMinBid) ? undefined : translate('screens/PlaceBidScreen', !hasSufficientFunds ? 'Insufficient funds' : 'Bid amount is lower than required')
            }}
          >
            <SetAmountButton
              amount={new BigNumber(minNextBidInToken)}
              onPress={onBidMinAmount}
              type={AmountButtonTypes.max}
              customText={translate('screens/PlaceBidScreen', 'MIN. BID')}
            />
          </WalletTextInput>
          <InputHelperText
            testID='text_balance_amount'
            label={`${translate('screens/PlaceBidScreen', 'Available')} `}
            content={ownedToken?.amount ?? '0.00'}
            suffix={` ${batch.loan.displaySymbol}`}
          />

          {displayHigherBidWarning && (
            <InfoText
              testID='conversion_info_text'
              text={translate('screens/PlaceBidScreen', 'The value of the tokens you are placing is considerably higher than the total auction value.')}
              style={tailwind('mt-5')}
            />
          )}

          <View style={tailwind(['-mx-4', { 'mt-4': Platform.OS !== 'web' }])}>
            <ThemedSectionTitle
              testID='title_tx_detail'
              text={translate('screens/PlaceBidScreen', 'TRANSACTION DETAILS')}
            />
            <FeeInfoRow
              type='ESTIMATED_FEE'
              value={fee.toFixed(8)}
              testID='text_fee'
              suffix='DFI'
            />
          </View>
        </View>

        <View>
          <Button
            label={translate('screens/PlaceBidScreen', 'CONTINUE')}
            disabled={blocksRemaining === 0 || !isValidMinBid || !hasSufficientFunds || hasPendingJob || hasPendingBroadcastJob}
            onPress={onSubmit}
            testID='button_submit'
            title='CONTINUE'
            margin='my-4'
          />
          <ThemedText
            light={tailwind('text-gray-500')}
            dark={tailwind('text-gray-400')}
            style={tailwind('text-center text-xs')}
          >
            {translate('screens/PlaceBidScreen', 'Review and confirm transaction in the next screen')}
          </ThemedText>
        </View>
        {Platform.OS === 'web' && (
          <BottomSheetWebWithNav
            modalRef={containerRef}
            screenList={bottomSheetScreen}
            isModalDisplayed={isModalDisplayed}
          />
        )}

        {Platform.OS !== 'web' && (
          <BottomSheetWithNav
            modalRef={bottomSheetRef}
            screenList={bottomSheetScreen}
          />
        )}
      </ThemedScrollView>
    </View>
  )
}

function BidSummaryCard (props: {
  displaySymbol: string
  collateralDisplaySymbols: string[]
  blockCount: number
  liquidationHeight: number
  minNextBid: string
  totalAuctionValue: string
  onPressFullDetails: () => void
  minNextBidInUSD: string
}): JSX.Element {
  return (
    <ThemedView
      dark={tailwind('bg-gray-800 border-gray-600')}
      light={tailwind('bg-white border-gray-300')}
      style={tailwind('border p-4 mb-4')}
    >
      <View style={tailwind('flex flex-row items-center mb-2 justify-between')}>
        <View style={tailwind('flex flex-row w-6/12 items-center')}>
          <SymbolIcon
            symbol={props.displaySymbol}
            styleProps={tailwind('w-5 h-5')}
          />
          <ThemedText style={tailwind('font-semibold ml-2')}>{props.displaySymbol}</ThemedText>
        </View>
        <View style={tailwind('flex flex-row')}>
          <CollateralTokenIconGroup
            title={translate('screens/PlaceBidScreen', 'Collateral')}
            symbols={props.collateralDisplaySymbols}
            maxIconToDisplay={3}
          />
        </View>
      </View>

      <VaultSectionTextRow
        value={getUSDPrecisedPrice(props.totalAuctionValue)}
        lhs={translate('screens/PlaceBidScreen', 'Total auction value (USD)')}
        testID='text_total_auction_value'
        suffixType='component'
        prefix='$'
      >
        <TouchableOpacity onPress={props.onPressFullDetails}>
          <ThemedText
            dark={tailwind('text-darkprimary-500')}
            light={tailwind('text-primary-500')}
            style={tailwind('text-xs')}
          >{` ${translate('screens/PlaceBidScreen', '(Full details)')}`}
          </ThemedText>
        </TouchableOpacity>
      </VaultSectionTextRow>
      <VaultSectionTextRow
        value={props.minNextBid}
        lhs={translate('screens/PlaceBidScreen', 'Min. next bid')}
        testID='text_min_next_bid'
        suffixType='text'
        suffix={props.displaySymbol}
      />
      <ActiveUSDValue
        price={new BigNumber(props.minNextBidInUSD)}
        containerStyle={tailwind('justify-end -mt-1')}
        style={tailwind('text-2xs')}
        testId='place_bid_min_next_bid_usd'
      />
      <View style={tailwind('mt-1')}>
        <AuctionTimeProgress
          liquidationHeight={props.liquidationHeight}
          blockCount={props.blockCount}
          label='Auction time left'
          auctionTextStyle={tailwind('text-xs')}
        />
      </View>
    </ThemedView>
  )
}
