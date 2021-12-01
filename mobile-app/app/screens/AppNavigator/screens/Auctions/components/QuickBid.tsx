import { ThemedIcon, ThemedText, ThemedView } from '@components/themed'
import { RootState } from '@store'
import { useSelector } from 'react-redux'
import React, { memo } from 'react'
import { tailwind } from '@tailwind'
import { View } from '@components'
import { SymbolIcon } from '@components/SymbolIcon'
import { translate } from '@translations'
import { TouchableOpacity } from 'react-native'
import { VaultSectionTextRow } from '../../Loans/components/VaultSectionTextRow'
import BigNumber from 'bignumber.js'
import { Button } from '@components/Button'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { hasTxQueued } from '@store/transaction_queue'

interface QuickBidProps {
  loanTokenId: string // TODO: remove if no use case
  loanTokenSymbol: string
  loanTokenDisplaySymbol: string
  onCloseButtonPress: () => void
  minNextBid: BigNumber
  currentBalance: BigNumber
}

export const QuickBid = ({
  loanTokenSymbol,
  loanTokenDisplaySymbol,
  minNextBid,
  currentBalance,
  onCloseButtonPress
}: QuickBidProps): React.MemoExoticComponent<() => JSX.Element> => memo(() => {
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))

  return (
    <ThemedView
      light={tailwind('bg-white')}
      dark={tailwind('bg-gray-800')}
      style={tailwind('px-4 h-full flex')}
    >
      <CloseButton onPress={onCloseButtonPress} />
      <HeaderSection symbol={loanTokenSymbol} />
      <BiddingInfo minNextBid={minNextBid} currentBalance={currentBalance} displaySymbol={loanTokenDisplaySymbol} />
      <Button
        disabled={hasPendingJob || hasPendingBroadcastJob}
        label={translate('components/QuickBid', 'QUICK BID')}
        onPress={() => { /* TODO: handle quick bid transaction */ }}
        testID='quick_bid_submit_button'
        margin='m-0'
        style={tailwind('items-end')}
      />
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
      <SymbolIcon symbol={props.symbol} styleProps={{ width: 32, height: 32 }} />
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
          message: 'The minimum bid a user must place, as long as it’s not the first bid for the batch.'
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
