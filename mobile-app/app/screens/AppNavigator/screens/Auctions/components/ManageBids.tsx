import * as React from 'react'
import { tailwind } from '@tailwind'
import { ThemedView } from '@components/themed'
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
import { LoanVaultLiquidationBatch } from '@defichain/whale-api-client/dist/api/loan'
import { BidCard } from './BidCard'
import { EmptyBidsScreen } from './EmptyBidsScreen'

export function ManageBids (): JSX.Element {
  const dispatch = useDispatch()
  const client = useWhaleApiClient()
  const { address } = useWalletContext()
  const blockCount = useSelector((state: RootState) => state.block.count)

  const auctions = useSelector((state: RootState) => state.loans.auctions)

  useEffect(() => {
    dispatch(fetchVaults({ address, client }))
  }, [blockCount])

  const { isBetaFeature } = useFeatureFlagContext()

  if (auctions.length === 0) {
    return (<EmptyBidsScreen />)
  }

  return (
    <ThemedView style={tailwind('h-full m-4')} testID='bid_cards'>
      {isBetaFeature('auction') && (
        <View style={tailwind('pb-4')}>
          <InfoText
            testID='beta_warning_info_text'
            text={translate('screens/FeatureFlagScreen', 'Feature is still in Beta. Use at your own risk.')}
          />
        </View>
      )}
      {auctions.map((auction, index) => {
        return (
          <View key={auction.vaultId}>
            {
            auction.batches.map((eachBatch: LoanVaultLiquidationBatch) => {
              return (
                <BidCard
                  vaultId={auction.vaultId}
                  batch={eachBatch}
                  key={`${auction.vaultId}_${eachBatch.index}`}
                  testID={`bid_card_${index}`}
                />
              )
            })
            }
          </View>
        )
      })}
    </ThemedView>
  )
}
