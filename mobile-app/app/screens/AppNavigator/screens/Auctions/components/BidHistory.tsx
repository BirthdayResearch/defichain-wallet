import { View } from '@components'
import { ThemedFlatList, ThemedIcon, ThemedText, ThemedView } from '@components/themed'
import { VaultAuctionBatchHistory } from '@defichain/whale-api-client/dist/api/loan'
import { useIsFocused } from '@react-navigation/native'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { RootState } from '@store'
import { auctions, fetchBidHistory } from '@store/auctions'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import { useEffect } from 'react'
import { Platform } from 'react-native'
import NumberFormat from 'react-number-format'
import { useDispatch, useSelector } from 'react-redux'
import { useTokenPrice } from '../../Balances/hooks/TokenPrice'
import { ActiveUSDValue } from '../../Loans/VaultDetail/components/ActiveUSDValue'
import { useBidTimeAgo } from '../hooks/BidTimeAgo'

interface BidHistoryProps {
  vaultId: string
  liquidationHeight: number
  batchIndex: number
  loanDisplaySymbol: string
  loanSymbol: string
  minNextBidInToken: string
}

export function BidHistory (props: BidHistoryProps): JSX.Element {
  const client = useWhaleApiClient()
  const dispatch = useDispatch()
  const blockCount = useSelector((state: RootState) => state.block.count) ?? 0
  const bidHistory = useSelector((state: RootState) => state.auctions.bidHistory)
  const { getTokenPrice } = useTokenPrice()
  const isFocused = useIsFocused()

  useEffect(() => {
    if (isFocused) {
      dispatch(fetchBidHistory({
        vaultId: props.vaultId,
        liquidationHeight: props.liquidationHeight,
        batchIndex: props.batchIndex,
        client: client,
        size: 200
      }))
    } else {
      dispatch(auctions.actions.resetBidHistory())
    }
  }, [blockCount, isFocused])

  return (
    <ThemedFlatList
      data={bidHistory}
      renderItem={({ item, index }: { item: VaultAuctionBatchHistory, index: number }): JSX.Element => {
        return (
          <BidHistoryItem
            bidIndex={bidHistory.length - index}
            bidAmount={item.amount}
            loanDisplaySymbol={props.loanDisplaySymbol}
            bidderAddress={item.from}
            bidAmountInUSD={getTokenPrice(props.loanSymbol, new BigNumber(item.amount))}
            isLatestBid={index === 0}
            bidBlockTime={item.block.time}
          />
        )
      }}
      ListEmptyComponent={() => (
        <EmptyBidHistory
          minNextBid={props.minNextBidInToken}
          displaySymbol={props.loanDisplaySymbol}
        />
      )}
      keyExtractor={(item: VaultAuctionBatchHistory) => item.id}
      contentContainerStyle={[tailwind('p-4 pb-8'), tailwind({ 'pb-44': Platform.OS !== 'android' && Platform.OS !== 'ios' })]}
      light={tailwind('bg-gray-50')}
      style={tailwind('-mb-1')}
      initialNumToRender={5}
      windowSize={2}
    />
  )
}

interface BidHistoryItemProps {
  bidIndex: number
  bidAmount: string
  loanDisplaySymbol: string
  bidderAddress: string
  bidAmountInUSD: BigNumber
  isLatestBid: boolean
  bidBlockTime: number
}

function BidHistoryItem (props: BidHistoryItemProps): JSX.Element {
  const bidTime = useBidTimeAgo(props.bidBlockTime)
  return (
    <ThemedView
      light={tailwind(['border-gray-200', { 'bg-white': props.isLatestBid, 'bg-gray-50': !props.isLatestBid }])}
      dark={tailwind(['border-gray-800', { 'bg-gray-800': props.isLatestBid, 'bg-gray-900': !props.isLatestBid }])}
      style={tailwind('border rounded px-4 py-3 mb-1')}
      testID={`bid_${props.bidIndex.toString()}`}
    >
      <View style={tailwind('flex flex-row justify-between mb-2 items-center')}>
        <ThemedView
          style={tailwind('px-1 rounded-sm')}
          light={tailwind(['text-white', { 'bg-blue-500': props.isLatestBid, 'bg-gray-400': !props.isLatestBid }])}
          dark={tailwind(['text-black', { 'bg-darkblue-500': props.isLatestBid, 'bg-gray-500': !props.isLatestBid }])}
        >
          <ThemedText
            style={tailwind('text-2xs')}
            light={tailwind('text-white')}
            dark={tailwind('text-black')}
          >
            {translate('components/BidHistory', 'BID #{{bidIndex}}', { bidIndex: props.bidIndex })}
          </ThemedText>
        </ThemedView>
        <ThemedText
          light={tailwind('text-gray-500')}
          dark={tailwind('text-gray-400')}
          style={tailwind('text-xs')}
        >
          {bidTime}
        </ThemedText>
      </View>
      <View style={tailwind('flex flex-row justify-between items-center')}>
        <NumberFormat
          value={props.bidAmount}
          thousandSeparator
          decimalScale={8}
          fixedDecimalScale
          displayType='text'
          renderText={value =>
            <ThemedText
              light={tailwind('text-gray-700')}
              dark={tailwind('text-gray-300')}
              style={tailwind('text-sm font-medium')}
              testID={`bid_${props.loanDisplaySymbol}_amount`}
            >
              {value}
              <ThemedText
                style={tailwind('text-xs')}
              >
                {` ${props.loanDisplaySymbol}`}
              </ThemedText>
            </ThemedText>}
        />
        <ThemedText
          numberOfLines={1}
          ellipsizeMode='middle'
          style={tailwind('w-4/12 text-xs font-medium')}
        >
          {props.bidderAddress}
        </ThemedText>
      </View>
      <View style={tailwind('flex flex-row justify-between')}>
        <ActiveUSDValue price={props.bidAmountInUSD} />
        <ThemedText
          light={tailwind('text-gray-500')}
          dark={tailwind('text-gray-400')}
          style={tailwind('text-xs')}
        >
          {translate('components/BidHistory', 'Bidder ID')}
        </ThemedText>
      </View>
    </ThemedView>
  )
}

function EmptyBidHistory (props: { minNextBid: string, displaySymbol: string }): JSX.Element {
  return (
    <View style={tailwind('mt-24 flex items-center')} testID='empty_bid_history'>
      <ThemedIcon
        iconType='MaterialCommunityIcons'
        name='circle-off-outline'
        size={30}
        light={tailwind('text-gray-900')}
        dark={tailwind('text-gray-50')}
        style={tailwind('mb-2')}
      />
      <ThemedText style={tailwind('text-lg font-semibold')}>
        {translate('components/BidHistory', 'Waiting for first bid')}
      </ThemedText>
      <NumberFormat
        value={props.minNextBid}
        suffix={` ${props.displaySymbol}`}
        displayType='text'
        thousandSeparator
        renderText={(value) =>
          <ThemedText
            light={tailwind('text-gray-700')}
            dark={tailwind('text-gray-200')}
            style={tailwind('text-sm text-center')}
          >
            {translate('components/BidHistory', 'Minimum amount to bid is')}
            <ThemedText
              light={tailwind('text-gray-700')}
              dark={tailwind('text-gray-200')}
              style={tailwind('text-sm font-semibold')}
              testID='empty_bid_min_bid_amount'
            >
              {` ${value}`}
            </ThemedText>
          </ThemedText>}
      />
    </View>
  )
}
