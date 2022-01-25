import { ThemedIcon, ThemedText, ThemedView, ThemedScrollView } from '@components/themed'
import { memo } from 'react'
import * as React from 'react'
import { tailwind } from '@tailwind'
import { View } from '@components'
import { SymbolIcon } from '@components/SymbolIcon'
import { translate } from '@translations'
import { TouchableOpacity } from 'react-native'
import { VaultSectionTextRow } from '../../Loans/components/VaultSectionTextRow'
import BigNumber from 'bignumber.js'
import { Button } from '@components/Button'
import { useSignBidAndSend } from '../hooks/SignBidAndSend'
import { PlaceAuctionBid } from '@defichain/jellyfish-transaction/dist'
import { LoanVaultLiquidated } from '@defichain/whale-api-client/dist/api/loan'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { useAuctionTime } from '../hooks/AuctionTimeLeft'

interface QuickBidProps {
  loanTokenId: string // TODO: remove if no use case
  loanTokenSymbol: string
  loanTokenDisplaySymbol: string
  onCloseButtonPress: () => void
  minNextBid: BigNumber
  currentBalance: BigNumber
  vaultId: PlaceAuctionBid['vaultId']
  index: PlaceAuctionBid['index']
  vaultLiquidationHeight: LoanVaultLiquidated['liquidationHeight']
}

export const QuickBid = ({
  vaultId,
  index,
  loanTokenId,
  loanTokenSymbol,
  loanTokenDisplaySymbol,
  minNextBid,
  currentBalance,
  onCloseButtonPress,
  vaultLiquidationHeight
}: QuickBidProps): React.MemoExoticComponent<() => JSX.Element> => memo(() => {
  const blockCount = useSelector((state: RootState) => state.block.count) ?? 0
  const { blocksRemaining } = useAuctionTime(vaultLiquidationHeight, blockCount)
  const isBalanceSufficient = currentBalance.gte(minNextBid)
  const {
    hasPendingJob,
    hasPendingBroadcastJob,
    constructSignedBidAndSend
  } = useSignBidAndSend()

  const onQuickBid = async (): Promise<void> => {
    await constructSignedBidAndSend({
      vaultId,
      index,
      tokenAmount: {
        amount: minNextBid,
        token: Number(loanTokenId)
      },
      displaySymbol: loanTokenDisplaySymbol,
      onBroadcast: () => {}
    })

    onCloseButtonPress()
  }

  return (
    <ThemedView
      light={tailwind('bg-white')}
      dark={tailwind('bg-gray-800')}
      style={tailwind('h-full flex')}
    >
      <View style={tailwind('px-4')}>
        <CloseButton onPress={onCloseButtonPress} />
      </View>
      <ThemedScrollView
        light={tailwind('bg-white')}
        dark={tailwind('bg-gray-800')}
        contentContainerStyle={tailwind('pb-8')}
      >
        <View style={tailwind('px-4')}>
          <HeaderSection symbol={loanTokenSymbol} />
          <BiddingInfo minNextBid={minNextBid} currentBalance={currentBalance} displaySymbol={loanTokenDisplaySymbol} />
          <Button
            disabled={blocksRemaining === 0 || !isBalanceSufficient || hasPendingJob || hasPendingBroadcastJob}
            label={translate('components/QuickBid', 'QUICK BID')}
            onPress={onQuickBid}
            testID='quick_bid_submit_button'
            margin='m-0'
            style={tailwind('items-end')}
          />
          {!isBalanceSufficient &&
            <ThemedText
              light={tailwind('text-error-500')}
              dark={tailwind('text-darkerror-500')}
              style={tailwind('text-center text-xs mt-2')}
            >
              {translate('components/QuickBid', 'Insufficient amount to place a bid')}
            </ThemedText>}
        </View>
      </ThemedScrollView>
    </ThemedView>
  )
})

function CloseButton (props: { onPress: () => void }): JSX.Element {
  return (
    <View style={tailwind('font-medium w-full mx-2 mb-3 items-end')}>
      <TouchableOpacity onPress={props.onPress}>
        <ThemedIcon
          size={24}
          name='close'
          iconType='MaterialIcons'
          dark={tailwind('text-white text-opacity-70')}
          light={tailwind('text-gray-700')}
        />
      </TouchableOpacity>
    </View>
  )
}

function HeaderSection (props: { symbol: string }): JSX.Element {
  return (
    <View style={tailwind('flex flex-row items-center mb-7')}>
      <SymbolIcon symbol={props.symbol} styleProps={tailwind('w-8 h-8')} />
      <View style={tailwind('ml-2')}>
        <ThemedText
          style={tailwind('text-lg font-medium')}
        >
          {translate('components/QuickBid', 'Quick bid')}
        </ThemedText>
        <ThemedText
          light={tailwind('text-gray-700')}
          dark={tailwind('text-gray-200')}
          style={tailwind('text-xs')}
        >
          {translate('components/QuickBid', 'Place a bid on the auctions with the min. next bid')}
        </ThemedText>
      </View>
    </View>
  )
}

function BiddingInfo (props: {minNextBid: BigNumber, currentBalance: BigNumber, displaySymbol: string}): JSX.Element {
  return (
    <View style={tailwind('mb-6')}>
      <VaultSectionTextRow
        value={props.minNextBid.toFixed(8)}
        lhs={translate('components/QuickBid', 'Min. next bid')}
        testID='text_min_next_bid'
        suffixType='text'
        suffix={props.displaySymbol}
        style={tailwind('text-base font-medium')}
        info={{
          title: 'Min. next bid',
          message: 'The minimum bid a user must place in order to take part in the auction.'
        }}
      />
      <VaultSectionTextRow
        value={props.currentBalance.toFixed(8)}
        lhs={translate('components/QuickBid', 'Current balance')}
        testID='text_current_balance'
        suffixType='text'
        suffix={props.displaySymbol}
      />
    </View>
  )
}
