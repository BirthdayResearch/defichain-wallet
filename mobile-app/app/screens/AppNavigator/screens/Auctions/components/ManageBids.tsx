import { tailwind } from '@tailwind'
import { ThemedScrollView } from '@components/themed'
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
import { LoanVaultLiquidated, LoanVaultLiquidationBatch } from '@defichain/whale-api-client/dist/api/loan'
import { BidCard } from './BidCard'
import { EmptyBidsScreen } from './EmptyBidsScreen'
import { useIsFocused } from '@react-navigation/native'

export function ManageBids (): JSX.Element {
  const dispatch = useDispatch()
  const client = useWhaleApiClient()
  const { address } = useWalletContext()
  const blockCount = useSelector((state: RootState) => state.block.count)
  const auctions = useSelector((state: RootState) => state.auctions.auctions)
  const isFocused = useIsFocused()

  useEffect(() => {
    if (isFocused) {
      dispatch(fetchVaults({ address, client }))
    }
  }, [blockCount, address, isFocused])

  const { isBetaFeature } = useFeatureFlagContext()

  if (auctions.length === 0) {
    return (<EmptyBidsScreen />)
  }

  return (
    <ThemedScrollView contentContainerStyle={tailwind('p-4')} testID='bid_cards'>
      {isBetaFeature('auction') && (
        <View style={tailwind('pb-4')}>
          <InfoText
            testID='beta_warning_info_text'
            text={translate('screens/FeatureFlagScreen', 'Feature is still in Beta. Use at your own risk.')}
          />
        </View>
      )}
      {auctions.map((auction: LoanVaultLiquidated, index: number) => {
        return (
          <View key={auction.vaultId}>
            {
            auction.batches.map((eachBatch: LoanVaultLiquidationBatch) => {
              return (
                <BidCard
                  vaultId={auction.vaultId}
                  liquidationHeight={auction.liquidationHeight}
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
    </ThemedScrollView>
  )
}
