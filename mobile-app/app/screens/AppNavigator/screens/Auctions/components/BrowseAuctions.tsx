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
import { fetchVaults } from '@store/loans'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { SkeletonLoader, SkeletonLoaderScreen } from '@components/SkeletonLoader'
import { LoanVaultLiquidated, LoanVaultLiquidationBatch } from '@defichain/whale-api-client/dist/api/loan'

export function BrowseAuctions (): JSX.Element {
  const dispatch = useDispatch()
  const client = useWhaleApiClient()
  const { address } = useWalletContext()
  const blockCount = useSelector((state: RootState) => state.block.count)
  const auctions = useSelector((state: RootState) => state.auctions.auctions)

  useEffect(() => {
    dispatch(fetchVaults({ address, client }))
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
      {auctions.length === 0 && (
        <View>
          <SkeletonLoader
            row={6}
            screen={SkeletonLoaderScreen.BrowseAuction}
          />
        </View>
      )}
      {auctions.map((auction: LoanVaultLiquidated, index: number) => {
        return (
          <View key={auction.vaultId}>
            {
            auction.batches.map((eachBatch: LoanVaultLiquidationBatch) => {
              return (
                <BatchCard
                  vaultId={auction.vaultId}
                  state={auction.state}
                  liquidationHeight={auction.liquidationHeight}
                  batch={eachBatch}
                  key={`${auction.vaultId}_${eachBatch.index}`}
                  testID={`batch_card_${index}`}
                />
              )
            })
            }
          </View>
        )
      })}
    </ThemedScrollView>
  )
}
