import * as React from 'react'
import { tailwind } from '@tailwind'
import BigNumber from 'bignumber.js'
import { ThemedView } from '@components/themed'
import { VaultCard } from '@screens/AppNavigator/screens/Loans/components/VaultCard'
import { useFeatureFlagContext } from '@contexts/FeatureFlagContext'
import { View } from 'react-native'
import { InfoText } from '@components/InfoText'
import { translate } from '@translations'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@store'
import { useEffect } from 'react'
import { fetchVaults } from '@store/loans'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { createSelector } from '@reduxjs/toolkit'
import { useWalletContext } from '@shared-contexts/WalletContext'

export function Vaults (): JSX.Element {
  const dispatch = useDispatch()
  const client = useWhaleApiClient()
  const { address } = useWalletContext()
  const blockCount = useSelector((state: RootState) => state.block.count)
  // temporary just for display, it will map the newly created ID to vaultAddress
  // Just to test e2e scenario
  const vaults = useSelector(createSelector((state: RootState) => state.loans.vaults, vaults => {
    return vaults.map((v) => {
      const temp = {
        collaterals: [
          { id: 'BTC', vaultProportion: new BigNumber(20) },
          { id: 'DFI', vaultProportion: new BigNumber(12.4573) },
          { id: 'dETH', vaultProportion: new BigNumber(55.123333) },
          { id: 'dLTC', vaultProportion: new BigNumber(20) },
          { id: 'dUSDC', vaultProportion: new BigNumber(20) }
        ],
        activeLoans: [{ tokenId: 'BTC' }, { tokenId: 'DFI' }, { tokenId: 'dETH' }],
        totalLoanAmount: new BigNumber('50000'),
        collateralAmount: new BigNumber('40000'),
        collateralRatio: new BigNumber('80'),
        actions: ['ADD_COLLATERAL', 'VIEW_LOANS']
      }
      return {
        ...temp,
        vaultAddress: v?.vaultId ?? '22ffasd5ca123123123123123121231061'
      }
    })
  }))

  useEffect(() => {
    dispatch(fetchVaults({ address, client }))
  }, [blockCount])
  const { isBetaFeature } = useFeatureFlagContext()

  return (
    <ThemedView style={tailwind('h-full m-4')}>
      {isBetaFeature('loan') && (
        <View style={tailwind('pb-4')}>
          <InfoText
            testID='beta_warning_info_text'
            text={translate('screens/FeatureFlagScreen', 'Feature is still in Beta. Use at your own risk.')}
          />
        </View>
      )}
      {vaults.map((vault, index) => {
        return <VaultCard testID={`vault_card_${index}`} key={index} {...vault} />
      })}
    </ThemedView>
  )
}
