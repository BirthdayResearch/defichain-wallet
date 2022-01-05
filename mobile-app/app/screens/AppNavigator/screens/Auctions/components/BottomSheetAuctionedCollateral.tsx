import { ThemedFlatList, ThemedIcon, ThemedText, ThemedView } from '@components/themed'
import { LoanVaultTokenAmount } from '@defichain/whale-api-client/dist/api/loan'
import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'
import { memo } from 'react'
import * as React from 'react'
import { Platform, TouchableOpacity } from 'react-native'
import { CollateralTokenItemRow } from './CollateralTokenItemRow'

interface BottomSheetAuctionedCollateralProps {
  collaterals: LoanVaultTokenAmount[]
  headerLabel: string
  onCloseButtonPress: () => void
}

export const BottomSheetAuctionedCollateral = ({
  collaterals,
  headerLabel,
  onCloseButtonPress
}: BottomSheetAuctionedCollateralProps): React.MemoExoticComponent<() => JSX.Element> => memo(() => {
  const { isLight } = useThemeContext()
  const flatListComponents = {
    mobile: BottomSheetFlatList,
    web: ThemedFlatList
  }
  const FlatList = Platform.OS === 'web' ? flatListComponents.web : flatListComponents.mobile

  return (
    <FlatList
      data={collaterals}
      renderItem={({ item }: { item: LoanVaultTokenAmount}): JSX.Element => (
        <CollateralTokenItemRow token={item} />
      )}
      ListHeaderComponent={
        <ThemedView
          light={tailwind('bg-white border-gray-200')}
          dark={tailwind('bg-gray-800 border-gray-700')}
          style={tailwind('flex flex-row justify-between items-center px-4 py-2 border-b', { 'py-3.5 border-t -mb-px': Platform.OS === 'android' })} // border top on android to handle 1px of horizontal transparent line when scroll past header
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
      keyExtractor={(item) => item.id}
      style={tailwind({
        'bg-gray-800': !isLight,
        'bg-white': isLight
      })}
    />
  )
})
