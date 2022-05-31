import { memo } from 'react'
import { ThemedFlatList, ThemedIcon, ThemedText, ThemedView, ThemedTouchableOpacity } from '@components/themed'
import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { Platform, TouchableOpacity } from 'react-native'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { useThemeContext } from '@shared-contexts/ThemeProvider'

export interface BottomSheetAssetSortProps {
  headerLabel: string
  onCloseButtonPress: () => void
  onButtonPress: (item: string) => void
  modifiedDenominationCurrency: string
}

export const BottomSheetAssetSortList = ({
  headerLabel,
  onCloseButtonPress,
  onButtonPress,
  modifiedDenominationCurrency
}: BottomSheetAssetSortProps): React.MemoExoticComponent<() => JSX.Element> => memo(() => {
  const { isLight } = useThemeContext()
  const flatListComponents = {
    mobile: BottomSheetFlatList,
    web: ThemedFlatList
  }
  const FlatList = Platform.OS === 'web' ? flatListComponents.web : flatListComponents.mobile
  const highestCurrencyValue = translate('screens/BalancesScreen', 'Highest {{modifiedDenominationCurrency}} value', { modifiedDenominationCurrency })
  const lowestCurrencyValue = translate('screens/BalancesScreen', 'Lowest {{modifiedDenominationCurrency}} value', { modifiedDenominationCurrency })
  const assetSortList: string[] = [highestCurrencyValue, lowestCurrencyValue, 'Highest token amount', 'Lowest token amount', 'A to Z', 'Z to A']

  const renderItem = ({
    item,
    index
  }: {
    item: string
    index: number
  }): JSX.Element => (
    <ThemedTouchableOpacity
      style={tailwind('px-4 py-3')}
      testID={`select_asset_${item}`}
      key={index}
      onPress={() => {
        onButtonPress(item)
      }}
    >
      <ThemedText>
        {translate('screens/BalancesScreen', item)}
      </ThemedText>
    </ThemedTouchableOpacity>
  )

  const headerComponent = (): JSX.Element => {
    return (
      <ThemedView
        light={tailwind('bg-white border-gray-200')}
        dark={tailwind('bg-gray-800 border-gray-700')}
        style={tailwind('flex flex-row justify-between items-center px-4 py-2 border-b', { 'py-3.5 border-t -mb-px': Platform.OS === 'android' })} // border top on android to handle 1px of horizontal transparent line when scroll past header
      >
        <ThemedText
          style={tailwind('text-lg font-medium')}
        >
          {translate('screens/BalancesScreen', headerLabel)}
        </ThemedText>
        <TouchableOpacity onPress={onCloseButtonPress}>
          <ThemedIcon iconType='MaterialIcons' name='close' size={20} />
        </TouchableOpacity>
      </ThemedView>
    )
  }

  return (
    <FlatList
      keyExtractor={(item) => item}
      data={assetSortList}
      renderItem={renderItem}
      ListHeaderComponent={headerComponent}
      style={tailwind({
        'bg-gray-800': !isLight,
        'bg-white': isLight
      })}
    />
  )
})
