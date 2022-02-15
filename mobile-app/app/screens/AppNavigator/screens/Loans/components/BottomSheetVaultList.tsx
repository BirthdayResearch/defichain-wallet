import { View } from '@components'
import { ThemedTouchableOpacity, ThemedText, ThemedView, ThemedIcon, ThemedFlatList } from '@components/themed'
import { LoanVaultActive, LoanVaultState } from '@defichain/whale-api-client/dist/api/loan'
import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { LoanVault } from '@store/loans'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { memo } from 'react'
import * as React from 'react'
import { Platform, TouchableOpacity } from 'react-native'
import { CollateralizationRatio } from './CollateralizationRatio'
import BigNumber from 'bignumber.js'
import { useVaultStatus, VaultStatusTag } from '@screens/AppNavigator/screens/Loans/components/VaultStatusTag'

interface BottomSheetVaultListProps {
  headerLabel: string
  onCloseButtonPress: () => void
  onVaultPress?: (vault: LoanVaultActive) => void
  navigateToScreen?: {
    screenName: string
    onButtonPress: () => void
  }
  vaults: LoanVault[]
}

export const BottomSheetVaultList = ({
  headerLabel,
  onCloseButtonPress,
  onVaultPress,
  vaults
}: BottomSheetVaultListProps): React.MemoExoticComponent<() => JSX.Element> => memo(() => {
  const { isLight } = useThemeContext()
  const flatListComponents = {
    mobile: BottomSheetFlatList,
    web: ThemedFlatList
  }
  const FlatList = Platform.OS === 'web' ? flatListComponents.web : flatListComponents.mobile

  return (
    <FlatList
      data={vaults}
      renderItem={({ item, index }: { item: LoanVault, index: number }): JSX.Element => {
        const colRatio = item.state === LoanVaultState.IN_LIQUIDATION ? 0 : item.collateralRatio
        const totalLoanAmount = item.state === LoanVaultState.IN_LIQUIDATION ? 0 : item.loanValue
        const totalCollateralValue = item.state === LoanVaultState.IN_LIQUIDATION ? 0 : item.collateralValue
        // eslint-disable-next-line
        const vaultState = useVaultStatus(item.state, new BigNumber(colRatio), new BigNumber(item.loanScheme.minColRatio), new BigNumber(totalLoanAmount), new BigNumber(totalCollateralValue))
        return (
          (
            <ThemedTouchableOpacity
              disabled={!(item.state === LoanVaultState.ACTIVE || item.state === LoanVaultState.MAY_LIQUIDATE)}
              onPress={() => {
                if (onVaultPress !== undefined && item.state !== LoanVaultState.IN_LIQUIDATION) {
                  onVaultPress(item)
                }
              }}
              testID={`select_vault_${index}`}
              style={tailwind('px-4 py-3.5 flex flex-row items-center justify-between')}
            >
              <View style={tailwind('flex flex-row w-6/12 flex-1 mr-12')}>
                <ThemedText
                  ellipsizeMode='middle'
                  numberOfLines={1}
                  style={tailwind('w-4/12 flex-grow mr-2')}
                >
                  {item.vaultId}
                </ThemedText>
                <VaultStatusTag status={vaultState.status} />
              </View>
              <View style={tailwind('flex items-end')}>
                <ThemedText
                  light={tailwind('text-gray-400')}
                  dark={tailwind('text-gray-500')}
                  style={tailwind('text-xs')}
                >
                  {translate('components/BottomSheetVaultList', 'Collateralization ratio')}
                </ThemedText>
                <CollateralizationRatio
                  totalLoanAmount={item.state === LoanVaultState.IN_LIQUIDATION ? new BigNumber(0) : new BigNumber(item.loanValue)}
                  colRatio={item.state === LoanVaultState.IN_LIQUIDATION ? new BigNumber(0) : new BigNumber(item.collateralRatio)}
                  minColRatio={item.state === LoanVaultState.IN_LIQUIDATION ? new BigNumber(0) : new BigNumber(item.loanScheme.minColRatio)}
                />
              </View>
            </ThemedTouchableOpacity>
          )
        )
      }}
      ListHeaderComponent={
        <ThemedView
          light={tailwind('bg-white border-gray-200')}
          dark={tailwind('bg-gray-800 border-gray-700')}
          style={tailwind('flex flex-row justify-between items-center px-4 py-2 border-b', { 'py-3.5 border-t -mb-px': Platform.OS === 'android' })}
        >
          <ThemedText
            style={tailwind('text-lg font-medium')}
          >
            {headerLabel}
          </ThemedText>
          <TouchableOpacity onPress={onCloseButtonPress}>
            <ThemedIcon iconType='MaterialIcons' name='close' size={20} />
          </TouchableOpacity>
        </ThemedView>
      }
      stickyHeaderIndices={[0]}
      keyExtractor={(item) => item.vaultId}
      style={tailwind({
        'bg-gray-800': !isLight,
        'bg-white': isLight
      })}
    />
  )
})
