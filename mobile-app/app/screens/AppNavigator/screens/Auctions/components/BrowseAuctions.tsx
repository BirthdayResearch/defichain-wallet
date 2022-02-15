import { useCallback, useEffect } from 'react'
import { tailwind } from '@tailwind'
import { ThemedFlatList, ThemedScrollView } from '@components/themed'
import { BatchCard } from '@screens/AppNavigator/screens/Auctions/components/BatchCard'
import { useFeatureFlagContext } from '@contexts/FeatureFlagContext'
import { Platform, View } from 'react-native'
import { InfoText } from '@components/InfoText'
import { translate } from '@translations'
import { batch, useDispatch, useSelector } from 'react-redux'
import { RootState } from '@store'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { SkeletonLoader, SkeletonLoaderScreen } from '@components/SkeletonLoader'
import { LoanVaultLiquidated, LoanVaultLiquidationBatch } from '@defichain/whale-api-client/dist/api/loan'
import { AuctionBatchProps, auctionsSearchByTermSelector, fetchAuctions } from '@store/auctions'
import { EmptyAuction } from './EmptyAuction'
import { BottomSheetWebWithNav, BottomSheetWithNav } from '@components/BottomSheetWithNav'
import { useBottomSheet } from '@hooks/useBottomSheet'
import BigNumber from 'bignumber.js'
import { QuickBid } from './QuickBid'
import { useDebounce } from '@hooks/useDebounce'
import { fetchVaults, LoanVault, vaultsSelector } from '@store/loans'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { fetchTokens, tokensSelector } from '@store/wallet'
import { useIsFocused } from '@react-navigation/native'

interface Props {
  searchString: string
}

export function BrowseAuctions ({ searchString }: Props): JSX.Element {
  const dispatch = useDispatch()
  const client = useWhaleApiClient()
  const { address } = useWalletContext()
  const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))
  const blockCount = useSelector((state: RootState) => state.block.count)
  const { hasFetchAuctionsData } = useSelector((state: RootState) => state.auctions)
  const vaults = useSelector((state: RootState) => vaultsSelector(state.loans))
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

  // Search
  const debouncedSearchTerm = useDebounce(searchString, 500)
  const filteredAuctionBatches = useSelector((state: RootState) => auctionsSearchByTermSelector(state.auctions, debouncedSearchTerm))

  useEffect(() => {
    if (isFocused) {
      batch(() => {
        dispatch(fetchTokens({ client, address }))
        dispatch(fetchAuctions({ client }))
        dispatch(fetchVaults({ client, address }))
      })
    }
  }, [address, blockCount, isFocused])

  const onQuickBid = (
    batch: LoanVaultLiquidationBatch,
    vaultId: string,
    minNextBidInToken: string,
    vaultLiquidationHeight: LoanVaultLiquidated['liquidationHeight']): void => {
    const ownedToken = tokens.find((token: { id: string }) => token.id === batch.loan.id)

    setBottomSheetScreen([{
      stackScreenName: 'Quick Bid',
      option: {
        header: () => null,
        headerBackTitleVisible: false
      },
      component: QuickBid({
        vaultId,
        index: batch.index,
        loanTokenId: batch.loan.id,
        loanTokenSymbol: batch.loan.symbol,
        loanTokenDisplaySymbol: batch.loan.displaySymbol,
        onCloseButtonPress: dismissModal,
        minNextBid: new BigNumber(minNextBidInToken),
        currentBalance: new BigNumber(ownedToken?.amount ?? 0),
        vaultLiquidationHeight
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
              {filteredAuctionBatches.length === 0
                ? <EmptyAuction />
                : (
                  <BatchCards
                    auctionBatches={filteredAuctionBatches}
                    onQuickBid={onQuickBid}
                    vaults={vaults}
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

function BatchCards ({ auctionBatches, vaults, onQuickBid }: {
  auctionBatches: AuctionBatchProps[]
    vaults: LoanVault[]
    onQuickBid: (
      batch: LoanVaultLiquidationBatch,
      vaultId: string,
      minNextBidInToken: string,
      vaultLiquidationHeight: LoanVaultLiquidated['liquidationHeight']) => void
  }): JSX.Element {
      const { isBetaFeature } = useFeatureFlagContext()

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
          isVaultOwner={vaults.some(vault => vault.vaultId === auction.vaultId)}
        />
      </View>
    )
  }, [])

  const ListHeaderComponent = useCallback(() => {
    if (isBetaFeature('auction')) {
      return (
        <View style={tailwind('pb-4')}>
          <InfoText
            testID='beta_warning_info_text'
            text={translate('screens/FeatureFlagScreen', 'Feature is still in Beta. Use at your own risk.')}
          />
        </View>
      )
    }
  return <></>
  }, [])

  return (
    <ThemedFlatList
      contentContainerStyle={tailwind('p-4 pb-2')}
      data={auctionBatches}
      initialNumToRender={15}
      numColumns={1}
      windowSize={15}
      keyExtractor={useCallback((_item, index) => index.toString(), [])}
      testID='available_liquidity_tab'
      renderItem={RenderItems}
      ListHeaderComponent={ListHeaderComponent}
    />
  )
}
