import { View } from '@components'
import { ThemedFlatList, ThemedText, ThemedView } from '@components/themed'
import { VaultAuctionBatchHistory } from '@defichain/whale-api-client/dist/api/loan'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { RootState } from '@store'
import { fetchBidHistory } from '@store/auctions'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import { useEffect } from 'react'
import NumberFormat from 'react-number-format'
import { useDispatch, useSelector } from 'react-redux'
import { ActiveUsdValue } from '../../Loans/VaultDetail/components/ActiveUsdValue'
import { useAuctionTime } from '../hooks/AuctionTimeLeft'

interface BidHistoryProps {
  vaultId: string
  liquidationHeight: number
  batchIndex: number
  loanDisplaySymbol: string
  loanActivePrice: string
}

export function BidHistory (props: BidHistoryProps): JSX.Element {
  const client = useWhaleApiClient()
  const dispatch = useDispatch()
  const bidHistory = useSelector((state: RootState) => state.auctions.bidHistory)

  useEffect(() => {
    dispatch(fetchBidHistory({
      vaultId: props.vaultId,
      liquidationHeight: props.liquidationHeight,
      batchIndex: props.batchIndex,
      client: client
    }))
  }, [])

  return (
    <ThemedFlatList
      data={bidHistory}
      renderItem={({ item, index }: { item: VaultAuctionBatchHistory, index: number }): JSX.Element => {
        return (
          <BidHistoryItem
            vaultLiquidationHeight={props.liquidationHeight}
            bidIndex={item.index}
            bidAmount={item.amount}
            loanDisplaySymbol={props.loanDisplaySymbol}
            bidderAddress={item.from}
            loanActivePrice={props.loanActivePrice}
            isLatestBid={index === 0}
          />
        )
      }}
      keyExtractor={(item: VaultAuctionBatchHistory) => item.id}
      contentContainerStyle={tailwind('p-4')}
    />
  )
}

interface BidHistoryItemProps {
  vaultLiquidationHeight: number
  bidIndex: number
  bidAmount: string
  loanDisplaySymbol: string
  bidderAddress: string
  loanActivePrice: string
  isLatestBid: boolean
}
function BidHistoryItem (props: BidHistoryItemProps): JSX.Element {
  const blockCount = useSelector((state: RootState) => state.block.count) ?? 0
  const { timeRemaining } = useAuctionTime(props.vaultLiquidationHeight, blockCount ?? 0)
  return (
    <ThemedView
      light={tailwind({ 'bg-white': props.isLatestBid, 'bg-gray-100': !props.isLatestBid })}
      dark={tailwind({ 'bg-gray-900': props.isLatestBid, 'bg-gray-800': !props.isLatestBid })}
      style={tailwind('border rounded px-4 py-3')}
    >
      <View style={tailwind('flex flex-row justify-between mb-2')}>
        <ThemedView
          style={tailwind('px-1 py-0.5')}
          light={tailwind('bg-blue-500')}
          dark={tailwind('bg-darkblue-500')}
        >
          <ThemedText>
            {translate('components/BidHistory', `BID #${props.bidIndex}`)}
          </ThemedText>
        </ThemedView>
        <ThemedText>
          {translate('components/BidHistory', '{{timeRemaining}} ago', { timeRemaining })}
        </ThemedText>
      </View>
      <View style={tailwind('flex flex-row justify-between')}>
        <NumberFormat
          value={props.bidAmount}
          thousandSeparator
          decimalScale={8}
          displayType='text'
          renderText={value =>
            <ThemedText
              light={tailwind('text-gray-700')}
              dark={tailwind('text-gray-300')}
              style={tailwind('text-sm')}
              testID={`bid_${props.loanDisplaySymbol}_amount`}
            >
              {value}
              <ThemedText
                style={tailwind('text-xs')}
              >
                {props.loanDisplaySymbol}
              </ThemedText>
            </ThemedText>}
        />
        <ThemedText
          numberOfLines={1}
          ellipsizeMode='middle'
        >
          {props.bidderAddress}
        </ThemedText>
      </View>
      <View style={tailwind('flex flex-row justify-between')}>
        <ActiveUsdValue price={new BigNumber(props.bidAmount).multipliedBy(props.loanActivePrice)} />
        <ThemedText>
          {translate('components/BidHistory', 'Bidder ID')}
        </ThemedText>
      </View>
    </ThemedView>
  )
}
