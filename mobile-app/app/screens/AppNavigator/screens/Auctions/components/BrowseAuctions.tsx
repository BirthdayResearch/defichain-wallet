import { useEffect, useMemo, useState } from 'react'
import { tailwind } from '@tailwind'
import { ThemedScrollView } from '@components/themed'
import { AuctionTabGroupKey, BatchCard } from '@screens/AppNavigator/screens/Auctions/components/BatchCard'
import { Dimensions, Platform, View } from 'react-native'
import { batch, useDispatch, useSelector } from 'react-redux'
import { RootState } from '@store'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { SkeletonLoader, SkeletonLoaderScreen } from '@components/SkeletonLoader'
import { LoanVaultLiquidated, LoanVaultLiquidationBatch } from '@defichain/whale-api-client/dist/api/loan'
import { AuctionBatchProps, fetchAuctions } from '@store/auctions'
import { EmptyAuction } from './EmptyAuction'
import { BottomSheetWebWithNav, BottomSheetWithNav } from '@components/BottomSheetWithNav'
import { useBottomSheet } from '@hooks/useBottomSheet'
import BigNumber from 'bignumber.js'
import { QuickBid } from './QuickBid'
import { useDebounce } from '@hooks/useDebounce'
import { fetchVaults } from '@store/loans'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { fetchTokens, tokensSelector } from '@store/wallet'
import { useIsFocused } from '@react-navigation/native'
import { useTokenPrice } from '../../Balances/hooks/TokenPrice'
import { RecyclerListView, DataProvider, LayoutProvider } from 'recyclerlistview'

interface Props {
  searchString: string
}

export interface onQuickBidProps {
  batch: LoanVaultLiquidationBatch
  vaultId: string
  minNextBidInToken: string
  vaultLiquidationHeight: LoanVaultLiquidated['liquidationHeight']
  minNextBidInUSD: string
}

const ViewTypes = {
  FULL: 0
}

export function BrowseAuctions ({ searchString }: Props): JSX.Element {
  console.log('browse auctions rerender')
  const dispatch = useDispatch()
  const client = useWhaleApiClient()
  const { address } = useWalletContext()
  const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))
  const blockCount = useSelector((state: RootState) => state.block.count)
  const { hasFetchAuctionsData, auctions } = useSelector((state: RootState) => state.auctions)
  const isFocused = useIsFocused()

  const {
    bottomSheetRef,
    containerRef,
    dismissModal,
    expandModal,
    isModalDisplayed,
    bottomSheetScreen,
    setBottomSheetScreen
  } = useBottomSheet()
  const { getTokenPrice } = useTokenPrice()

  // Search and Tab Group
  const [activeAuctionTabGroupKey, setActiveAuctionTabGroupKey] = useState<AuctionTabGroupKey>(AuctionTabGroupKey.AllAuctions)
  const debouncedSearchTerm = useDebounce(searchString, 500)
  const filteredAuctionBatches = useMemo(() => {
    const filters = {
      searchTerm: debouncedSearchTerm,
      activeAuctionTabGroupKey,
      walletAddress: address
    }
    const hasNoSearchTerm = filters.searchTerm === '' || filters.searchTerm === undefined
    return auctions.reduce<AuctionBatchProps[]>((auctionBatches, auction): AuctionBatchProps[] => {
      const filteredAuctionBatches = auctionBatches
      auction.batches.forEach(batch => {
        const isIncludedInSearchTerm = (filters.searchTerm !== '' && filters.searchTerm !== undefined && batch.loan.displaySymbol.toLowerCase().includes(filters.searchTerm.trim().toLowerCase()))

        if (hasNoSearchTerm) {
          filteredAuctionBatches.push({
            ...batch, auction
          })
        } else if (isIncludedInSearchTerm) {
          filteredAuctionBatches.push({
            ...batch, auction
          })
        }
        // const isIncludedInSearchTerm = hasNoSearchTerm || (filters.searchTerm !== '' && filters.searchTerm !== undefined && batch.loan.displaySymbol.toLowerCase().includes(filters.searchTerm.trim().toLowerCase()))
        // const hasPlacedBid = batch.froms.some(bidder => bidder === filters.walletAddress)
        // const isVaultOwner = auction.ownerAddress === filters.walletAddress
        // if (isIncludedInSearchTerm && isVaultOwner && filters.activeAuctionTabGroupKey === AuctionTabGroupKey.FromYourVault) {
        //   filteredAuctionBatches.push({
        //     ...batch, auction
        //   })
        // } else if (isIncludedInSearchTerm && hasPlacedBid && filters.activeAuctionTabGroupKey === AuctionTabGroupKey.WithPlacedBids) {
        //   filteredAuctionBatches.push({
        //     ...batch, auction
        //   })
        // } else if (isIncludedInSearchTerm && filters.activeAuctionTabGroupKey === AuctionTabGroupKey.AllAuctions) {
        //   filteredAuctionBatches.push({
        //     ...batch, auction
        //   })
        // }
      })

      return filteredAuctionBatches
    }, [])
      .sort((a, b) => {
        // const hasPlacedBidA = a.froms.some(bidder => bidder === filters.walletAddress)
        // const hasPlacedBidB = b.froms.some(bidder => bidder === filters.walletAddress)
        // const isHighestBidA = a.highestBid?.owner === filters.walletAddress
        // const isHighestBidB = b.highestBid?.owner === filters.walletAddress
        // const fromYourVaultA = a.auction.ownerAddress === filters.walletAddress
        // const fromYourVaultB = b.auction.ownerAddress === filters.walletAddress

        // if (
        //   hasPlacedBidA && hasPlacedBidB &&
        //   !isHighestBidA && !isHighestBidB) {
        //   return new BigNumber(a.auction.liquidationHeight).minus(b.auction.liquidationHeight).toNumber()
        // } else if (hasPlacedBidA !== hasPlacedBidB) {
        //   return hasPlacedBidA ? -1 : 1
        // } else if (fromYourVaultA !== fromYourVaultB) {
        //   return fromYourVaultA ? -1 : 1
        // } else if (isHighestBidA !== isHighestBidB) {
        //   return isHighestBidA ? 1 : -1
        // }

        return new BigNumber(a.auction.liquidationHeight).minus(b.auction.liquidationHeight).toNumber()
      })
  }, [auctions, debouncedSearchTerm, activeAuctionTabGroupKey, address])

  useEffect(() => {
    if (isFocused) {
      batch(() => {
        dispatch(fetchTokens({ client, address }))
        dispatch(fetchAuctions({ client }))
        dispatch(fetchVaults({ client, address }))
      })
    }
  }, [address, blockCount, isFocused])

  const onAuctionTabGroupChange = (auctionTabGroupKey: AuctionTabGroupKey): void => {
    setActiveAuctionTabGroupKey(auctionTabGroupKey)
  }

  const onQuickBid = (props: onQuickBidProps): void => {
    const ownedToken = tokens.find(token => token.id === props.batch.loan.id)
    const currentBalance = new BigNumber(ownedToken?.amount ?? 0)

    setBottomSheetScreen([{
      stackScreenName: 'Quick Bid',
      option: {
        header: () => null,
        headerBackTitleVisible: false
      },
      component: QuickBid({
        vaultId: props.vaultId,
        index: props.batch.index,
        loanTokenId: props.batch.loan.id,
        loanTokenSymbol: props.batch.loan.symbol,
        loanTokenDisplaySymbol: props.batch.loan.displaySymbol,
        onCloseButtonPress: dismissModal,
        minNextBid: new BigNumber(props.minNextBidInToken),
        minNextBidInUSD: props.minNextBidInUSD,
        currentBalance: currentBalance,
        currentBalanceInUSD: getTokenPrice(props.batch.loan.symbol, currentBalance),
        vaultLiquidationHeight: props.vaultLiquidationHeight
      })
    }])
    expandModal()
  }

  return (
    <View
      ref={containerRef}
      style={tailwind('h-full')}
      testID='auctions_cards'
    >
      {hasFetchAuctionsData
        ? (
          <>
            {auctions.length === 0
              ? <EmptyAuction />
              : (
                <BatchCards
                  auctionBatches={filteredAuctionBatches}
                  onQuickBid={onQuickBid}
                  buttonGroupOptions={{
                    activeButtonGroup: activeAuctionTabGroupKey,
                    setActiveButtonGroup: setActiveAuctionTabGroupKey,
                    onButtonGroupPress: onAuctionTabGroupChange
                  }}
                />
              )}
          </>)
        : (
          <ThemedScrollView contentContainerStyle={tailwind('p-4')}>
            <SkeletonLoader
              row={6}
              screen={SkeletonLoaderScreen.BrowseAuction}
            />
          </ThemedScrollView>
        )}

      {Platform.OS === 'web' && (
        <BottomSheetWebWithNav
          modalRef={containerRef}
          screenList={bottomSheetScreen}
          isModalDisplayed={isModalDisplayed}
          modalStyle={{
            position: 'absolute',
            height: '240px',
            width: '375px',
            zIndex: 50,
            bottom: 0
          }}
        />
      )}

      {Platform.OS !== 'web' && (
        <BottomSheetWithNav
          modalRef={bottomSheetRef}
          screenList={bottomSheetScreen}
          snapPoints={{
            ios: ['40%'],
            android: ['40%']
          }}
        />
      )}
    </View>
  )
}

function BatchCards ({
  auctionBatches,
  onQuickBid,
  buttonGroupOptions
}: {
  auctionBatches: AuctionBatchProps[]
  onQuickBid: (props: onQuickBidProps) => void
  buttonGroupOptions?: {
    onButtonGroupPress: (key: AuctionTabGroupKey) => void
    activeButtonGroup: string
    setActiveButtonGroup: (key: AuctionTabGroupKey) => void
  }
}): JSX.Element {
  const { address } = useWalletContext()
  // const RenderItems = useCallback(({
  //   item,
  //   index
  // }: { item: AuctionBatchProps, index: number }): JSX.Element => {
  //   const { auction, ...batch } = item
  //   return (
  //     <View key={auction.vaultId}>
  //       <BatchCard
  //         vault={auction}
  //         batch={batch}
  //         key={`${auction.vaultId}_${batch.index}`}
  //         testID={`batch_card_${index}`}
  //         onQuickBid={onQuickBid}
  //         isVaultOwner={auction.ownerAddress === address}
  //       />
  //     </View>
  //   )
  // }, [])

  // const onButtonGroupChange = (auctionTabGroupKey: AuctionTabGroupKey): void => {
  //   if (buttonGroupOptions !== undefined) {
  //     buttonGroupOptions.setActiveButtonGroup(auctionTabGroupKey)
  //     buttonGroupOptions.onButtonGroupPress(auctionTabGroupKey)
  //   }
  // }

  // const ListHeaderComponent = useCallback(() => {
  //   const buttonGroup = [
  //     {
  //       id: AuctionTabGroupKey.AllAuctions,
  //       label: translate('screens/BrowseAuctions', 'All auctions'),
  //       handleOnPress: () => onButtonGroupChange(AuctionTabGroupKey.AllAuctions)
  //     },
  //     {
  //       id: AuctionTabGroupKey.FromYourVault,
  //       label: translate('screens/BrowseAuctions', 'From your vault'),
  //       handleOnPress: () => onButtonGroupChange(AuctionTabGroupKey.FromYourVault)
  //     },
  //     {
  //       id: AuctionTabGroupKey.WithPlacedBids,
  //       label: translate('screens/BrowseAuctions', 'With placed bids'),
  //       handleOnPress: () => onButtonGroupChange(AuctionTabGroupKey.WithPlacedBids)
  //     }
  //   ]

  //   return (
  //     <>
  //       {buttonGroupOptions !== undefined &&
  //         <View style={tailwind('mb-4')}>
  //           <ButtonGroup buttons={buttonGroup} activeButtonGroupItem={buttonGroupOptions.activeButtonGroup} testID='auctions_button_group' />
  //         </View>}
  //     </>
  //   )
  // }, [buttonGroupOptions])

  // const getEmptyAuctionsText = (): string => {
  //   switch (buttonGroupOptions?.activeButtonGroup) {
  //     case AuctionTabGroupKey.FromYourVault:
  //       return translate('screens/BrowseAuctions', 'No available auctions from your vault')
  //     case AuctionTabGroupKey.WithPlacedBids:
  //       return translate('screens/BrowseAuctions', 'No available auctions with placed bids')
  //     default:
  //       return translate('screens/BrowseAuctions', 'No available auctions')
  //   }
  // }
  const { width } = Dimensions.get('window')
  const layoutProvider = useMemo(() => {
    return new LayoutProvider(
    index => {
      return ViewTypes.FULL
    },
    (type, dim) => {
      dim.width = width
      dim.height = 233
    })
  }, [width])

  // Create the data provider and provide method which takes in two rows of data and return if those two are different or not.
  // THIS IS VERY IMPORTANT, FORGET PERFORMANCE IF THIS IS MESSED UP
  const dataProviderX = new DataProvider((r1, r2): any => {
    return r1 !== r2
  })

  const _generateArray = (): any => {
    return auctionBatches
  }
  const dataProvider = dataProviderX.cloneWithRows(_generateArray())

  // Given type and data return the view component
  const _rowRenderer = (_type: string, data: AuctionBatchProps): JSX.Element => {
    const { auction, ...batch } = data
    return (
      <BatchCard
        vault={auction}
        batch={batch}
        key={`${auction.vaultId}_${batch.index}`}
        testID='test'
        onQuickBid={onQuickBid}
        isVaultOwner={auction.ownerAddress === address}
      />
    )
  }

  return (
    <>
      <RecyclerListView
        layoutProvider={layoutProvider}
        dataProvider={dataProvider}
        rowRenderer={_rowRenderer}
        initialOffset={0}
        renderAheadOffset={400}
      />
      {/* <ThemedFlatList
      light={tailwind('bg-gray-50')}
      dark={tailwind('bg-gray-900')}
      contentContainerStyle={tailwind('p-4 pb-2')}
      data={auctionBatches}
      numColumns={1}
      initialNumToRender={5}
      windowSize={2}
      keyExtractor={(_item, index) => index.toString()}
      testID='available_liquidity_tab'
      renderItem={RenderItems}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={() => <ThemedText style={tailwind('text-sm')} testID='empty_auctions_list'>{getEmptyAuctionsText()}</ThemedText>}
    /> */}
    </>
  )
}
