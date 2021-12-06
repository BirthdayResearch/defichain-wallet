import React, { useEffect } from 'react'
import { tailwind } from '@tailwind'
import { ThemedScrollView } from '@components/themed'
import { BatchCard } from '@screens/AppNavigator/screens/Auctions/components/BatchCard'
import { useFeatureFlagContext } from '@contexts/FeatureFlagContext'
import { Platform, View } from 'react-native'
import { InfoText } from '@components/InfoText'
import { translate } from '@translations'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@store'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { SkeletonLoader, SkeletonLoaderScreen } from '@components/SkeletonLoader'
import { LoanVaultLiquidated, LoanVaultLiquidationBatch } from '@defichain/whale-api-client/dist/api/loan'
import { fetchAuctions } from '@store/auctions'
import { EmptyAuction } from './EmptyAuction'
import { BottomSheetWebWithNav, BottomSheetWithNav } from '@components/BottomSheetWithNav'
import { useBottomSheet } from '@hooks/useBottomSheet'
import BigNumber from 'bignumber.js'
import { QuickBid } from './QuickBid'
import { useTokensAPI } from '@hooks/wallet/TokensAPI'
import { createSelector } from '@reduxjs/toolkit'
import { useDebounce } from '@hooks/useDebounce'
import { fetchVaults, vaultsSelector } from '@store/loans'
import { useWalletContext } from '@shared-contexts/WalletContext'

interface Props {
  searchString: string
}

export function BrowseAuctions ({ searchString }: Props): JSX.Element {
  const dispatch = useDispatch()
  const client = useWhaleApiClient()
  const { address } = useWalletContext()
  const tokens = useTokensAPI()
  const { isBetaFeature } = useFeatureFlagContext()

  const blockCount = useSelector((state: RootState) => state.block.count)
  const { hasFetchAuctionsData } = useSelector((state: RootState) => state.auctions)
  const vaults = useSelector((state: RootState) => vaultsSelector(state.loans))
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
  const filteredAuctions = useSelector(createSelector((state: RootState) => state.auctions.auctions, (auctions: LoanVaultLiquidated[]) => {
    return auctions
      .map((auction) => {
        const filteredBatches = debouncedSearchTerm !== '' && debouncedSearchTerm !== undefined
          ? auction.batches.filter(batch => batch.loan.displaySymbol.toLowerCase().includes(debouncedSearchTerm.trim().toLowerCase()))
          : auction.batches

        return {
          ...auction,
          batches: filteredBatches,
          batchCount: filteredBatches.length
        }
      })
      .sort((a, b) => new BigNumber(a.liquidationHeight).minus(b.liquidationHeight).toNumber())
  }))

  useEffect(() => {
    dispatch(fetchAuctions({ client }))

    dispatch(fetchVaults({
      address,
      client
    }))
  }, [blockCount])

  const onQuickBid = (
    batch: LoanVaultLiquidationBatch,
    vaultId: string,
    minNextBidInToken: string,
    vaultLiquidationHeight: LoanVaultLiquidated['liquidationHeight']): void => {
    const ownedToken = tokens.find(token => token.id === batch.loan.id)

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
    <View ref={containerRef} style={tailwind('h-full')}>
      <ThemedScrollView contentContainerStyle={tailwind('p-4')} testID='auctions_cards'>
        {isBetaFeature('auction') && (
          <View style={tailwind('pb-4')}>
            <InfoText
              testID='beta_warning_info_text'
              text={translate('screens/FeatureFlagScreen', 'Feature is still in Beta. Use at your own risk.')}
            />
          </View>
        )}
        {hasFetchAuctionsData
          ? (
            <>
              {filteredAuctions.length === 0
                ? <EmptyAuction />
                : (
                  <>
                    {filteredAuctions.map((auction: LoanVaultLiquidated, index: number) => {
                      return (
                        <View key={auction.vaultId}>
                          {auction.batches.map((eachBatch: LoanVaultLiquidationBatch) => {
                            return (
                              <BatchCard
                                vault={auction}
                                batch={eachBatch}
                                key={`${auction.vaultId}_${eachBatch.index}`}
                                testID={`batch_card_${index}`}
                                onQuickBid={onQuickBid}
                                isVaultOwner={vaults.some(vault => vault.vaultId === auction.vaultId)}
                              />
                            )
                          })}
                        </View>
                      )
                    })}
                  </>
                )}
            </>)
          : (
            <View style={tailwind('pb-4')}>
              <SkeletonLoader
                row={6}
                screen={SkeletonLoaderScreen.BrowseAuction}
              />
            </View>
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
              ios: '40%',
              android: '40%'
            }}
          />
        )}
      </ThemedScrollView>
    </View>
  )
}
