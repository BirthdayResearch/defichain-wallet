import * as React from 'react'
import { tailwind } from '@tailwind'
import { ThemedScrollView } from '@components/themed'
import { BatchCard } from '@screens/AppNavigator/screens/Auctions/components/BatchCard'
import { useFeatureFlagContext } from '@contexts/FeatureFlagContext'
import { View } from 'react-native'
import { InfoText } from '@components/InfoText'
import { translate } from '@translations'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@store'
import { useEffect } from 'react'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { SkeletonLoader, SkeletonLoaderScreen } from '@components/SkeletonLoader'
import { LoanVaultLiquidated, LoanVaultLiquidationBatch } from '@defichain/whale-api-client/dist/api/loan'
import { auctionsSelector, fetchAuctions } from '@store/auctions'
import { EmptyAuctionsScreen } from './EmptyAuctionsScreen'

export function BrowseAuctions (): JSX.Element {
  const dispatch = useDispatch()
  const client = useWhaleApiClient()
  const blockCount = useSelector((state: RootState) => state.block.count)
  const auctions = useSelector((state: RootState) => auctionsSelector(state.auctions))
  const { hasFetchAuctionsData } = useSelector((state: RootState) => state.auctions)

  useEffect(() => {
    dispatch(fetchAuctions({ client }))
  }, [blockCount])

  const { isBetaFeature } = useFeatureFlagContext()

  return (
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
          ? <EmptyAuctionsScreen />
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

    </ThemedScrollView>
  )
}
