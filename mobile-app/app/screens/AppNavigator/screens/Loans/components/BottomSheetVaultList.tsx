import { View } from '@components'
import { ThemedFlatList, ThemedTouchableOpacity, ThemedText, ThemedView, ThemedIcon } from '@components/themed'
import { LoanVaultActive } from '@defichain/whale-api-client/dist/api/loan'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { RootState } from '@store'
import { fetchVaults, nonLiquidatedVault } from '@store/loans'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import React, { memo, useEffect } from 'react'
import { Platform, TouchableOpacity } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { CollateralizationRatio } from './CollateralizationRatio'

interface BottomSheetVaultListProps {
  headerLabel: string
  onCloseButtonPress: () => void
  onVaultPress?: (vault: LoanVaultActive) => void
  navigateToScreen?: {
    screenName: string
    onButtonPress: () => void
  }
}

export const BottomSheetVaultList = ({
  headerLabel,
  onCloseButtonPress,
  onVaultPress
}: BottomSheetVaultListProps): React.MemoExoticComponent<() => JSX.Element> => memo(() => {
  const vaults = useSelector((state: RootState) => nonLiquidatedVault(state.loans))
  const { address } = useWalletContext()
  const client = useWhaleApiClient()
  const blockCount = useSelector((state: RootState) => state.block.count)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchVaults({
      address,
      client
    }))
  }, [blockCount])

  return (
    <ThemedFlatList
      data={vaults}
      renderItem={({ item }: { item: LoanVaultActive}): JSX.Element => (
        <ThemedTouchableOpacity
          onPress={() => {
            if (onVaultPress !== undefined) {
              onVaultPress(item)
            }
          }}
          style={tailwind('px-4 py-3.5 flex flex-row items-center justify-between')}
        >
          <View style={tailwind('flex flex-row w-6/12 flex-1 mr-12')}>
            <View style={tailwind('flex flex-row items-center')}>
              <ThemedText
                ellipsizeMode='middle'
                numberOfLines={1}
                style={tailwind('w-4/12 flex-grow mr-2')}
              >
                {item.vaultId}
              </ThemedText>
              {/* <VaultStatusTag status={VaultStatus.Healthy} // TODO: add status tag /> */}
            </View>
          </View>
          <View style={tailwind('flex items-end')}>
            <ThemedText
              light={tailwind('text-gray-400')}
              dark={tailwind('text-gray-500')}
              style={tailwind('text-xs')}
            >
              {translate('components/BottomSheetVaultList', 'Collateral ratio')}
            </ThemedText>
            <CollateralizationRatio value={item.collateralRatio} minColRatio={item.loanScheme.minColRatio} />
          </View>
        </ThemedTouchableOpacity>
      )}
      ListHeaderComponent={
        <ThemedView
          light={tailwind('bg-white border-gray-200')}
          dark={tailwind('bg-gray-800 border-gray-700')}
          style={tailwind('flex flex-row justify-between items-center px-4 py-2 border-b', { 'h-14 mt-px': Platform.OS === 'android' })}
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
    />
  )
})
