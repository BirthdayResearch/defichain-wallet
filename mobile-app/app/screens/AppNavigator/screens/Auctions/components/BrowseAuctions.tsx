import * as React from 'react'
import { tailwind } from '@tailwind'
import { ThemedScrollView } from '@components/themed'
import { BatchCard } from '@screens/AppNavigator/screens/Auctions/components/BatchCard'
import { useFeatureFlagContext } from '@contexts/FeatureFlagContext'
import { Platform, View } from 'react-native'
import { InfoText } from '@components/InfoText'
import { translate } from '@translations'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@store'
import { useEffect } from 'react'
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

export function BrowseAuctions (): JSX.Element {
  const dispatch = useDispatch()
  const client = useWhaleApiClient()
  const tokens = useTokensAPI()
  const blockCount = useSelector((state: RootState) => state.block.count)
  const auctions = useSelector((state: RootState) => state.auctions.auctions)
  const { hasFetchAuctionsData } = useSelector((state: RootState) => state.auctions)
  const {
    bottomSheetRef,
    containerRef,
    dismissModal,
    expandModal,
    isModalDisplayed,
    bottomSheetScreen,
    setBottomSheetScreen
   } = useBottomSheet()

  useEffect(() => {
    dispatch(fetchAuctions({ client }))
  }, [blockCount])

  const { isBetaFeature } = useFeatureFlagContext()
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
            {auctions.length === 0
            ? <EmptyAuction />
              : (
                <>
                  {auctions.map((auction: LoanVaultLiquidated, index: number) => {
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
