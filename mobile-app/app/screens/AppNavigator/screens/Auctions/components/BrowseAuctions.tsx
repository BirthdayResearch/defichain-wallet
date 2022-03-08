import { useCallback, useEffect, useState } from 'react'
import { tailwind } from '@tailwind'
import { ThemedFlatList, ThemedScrollView, ThemedText } from '@components/themed'
import { BatchCard } from '@screens/AppNavigator/screens/Auctions/components/BatchCard'
import { useFeatureFlagContext } from '@contexts/FeatureFlagContext'
import { Platform, View } from 'react-native'
import { InfoText } from '@components/InfoText'
import { translate } from '@translations'
import { useDispatch, useSelector, batch } from 'react-redux'
import { RootState } from '@store'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { SkeletonLoader, SkeletonLoaderScreen } from '@components/SkeletonLoader'
import { LoanVaultLiquidated, LoanVaultLiquidationBatch } from '@defichain/whale-api-client/dist/api/loan'
import { AuctionBatchProps, auctionsSearchByFilterSelector, fetchAuctions } from '@store/auctions'
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
import { ButtonGroup } from '../../Dex/components/ButtonGroup'

interface Props {
  searchString: string
}

export enum AuctionTabGroupKey {
  AllAuctions = 'ALL_AUCTIONS',
  FromYourVault = 'FROM_YOUR_VAULT',
  WithPlacedBids = 'WITH_PLACED_BIDS'
}

export interface onQuickBidProps {
  batch: LoanVaultLiquidationBatch
  vaultId: string
  minNextBidInToken: string
  vaultLiquidationHeight: LoanVaultLiquidated['liquidationHeight']
  minNextBidInUSD: string
}

export function BrowseAuctions ({ searchString }: Props): JSX.Element {
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
  const filteredAuctionBatches = useSelector((state: RootState) => auctionsSearchByFilterSelector(state.auctions, { searchTerm: debouncedSearchTerm, activeAuctionTabGroupKey, walletAddress: address }))

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
  const { isBetaFeature } = useFeatureFlagContext()
  const { address } = useWalletContext()
  const RenderItems = useCallback(({
    item,
    index
  }: { item: AuctionBatchProps, index: number }): JSX.Element => {
    const { auction, ...batch } = item
    return (
      <View key={auction.vaultId}>
        <BatchCard
          vault={auction}
          batch={batch}
          key={`${auction.vaultId}_${batch.index}`}
          testID={`batch_card_${index}`}
          onQuickBid={onQuickBid}
          isVaultOwner={auction.ownerAddress === address}
        />
      </View>
    )
  }, [])

  const onButtonGroupChange = (auctionTabGroupKey: AuctionTabGroupKey): void => {
    if (buttonGroupOptions !== undefined) {
      buttonGroupOptions.setActiveButtonGroup(auctionTabGroupKey)
      buttonGroupOptions.onButtonGroupPress(auctionTabGroupKey)
    }
  }

  const ListHeaderComponent = useCallback(() => {
    const buttonGroup = [
      {
        id: AuctionTabGroupKey.AllAuctions,
        label: translate('screens/BrowseAuctions', 'All'),
        handleOnPress: () => onButtonGroupChange(AuctionTabGroupKey.AllAuctions),
        widthPercentage: new BigNumber(16)
      },
      {
        id: AuctionTabGroupKey.FromYourVault,
        label: translate('screens/BrowseAuctions', 'From your vault'),
        handleOnPress: () => onButtonGroupChange(AuctionTabGroupKey.FromYourVault),
        widthPercentage: new BigNumber(42)
      },
      {
        id: AuctionTabGroupKey.WithPlacedBids,
        label: translate('screens/BrowseAuctions', 'With placed bids'),
        handleOnPress: () => onButtonGroupChange(AuctionTabGroupKey.WithPlacedBids),
        widthPercentage: new BigNumber(42)
      }
    ]

    return (
      <>
        {isBetaFeature('auction') &&
          <View style={tailwind('pb-4')}>
            <InfoText
              testID='beta_warning_info_text'
              text={translate('screens/FeatureFlagScreen', 'Feature is still in Beta. Use at your own risk.')}
            />
          </View>}
        {buttonGroupOptions !== undefined &&
          <View style={tailwind('mb-4')}>
            <ButtonGroup buttons={buttonGroup} activeButtonGroupItem={buttonGroupOptions.activeButtonGroup} testID='auctions_button_group' />
          </View>}
      </>
    )
  }, [buttonGroupOptions])

  const getEmptyAuctionsText = (): string => {
    switch (buttonGroupOptions?.activeButtonGroup) {
      case AuctionTabGroupKey.FromYourVault:
        return translate('screens/BrowseAuctions', 'No available auctions from your vault')
      case AuctionTabGroupKey.WithPlacedBids:
        return translate('screens/BrowseAuctions', 'No available auctions with placed bids')
      default:
        return translate('screens/BrowseAuctions', 'No available auctions')
    }
  }

  return (
    <ThemedFlatList
      contentContainerStyle={tailwind('p-4 pb-2')}
      data={auctionBatches}
      numColumns={1}
      initialNumToRender={5}
      windowSize={2}
      keyExtractor={(_item, index) => index.toString()}
      testID='available_liquidity_tab'
      renderItem={RenderItems}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={() => <ThemedText testID='empty_auctions_list'>{getEmptyAuctionsText()}</ThemedText>}
    />
  )
}
