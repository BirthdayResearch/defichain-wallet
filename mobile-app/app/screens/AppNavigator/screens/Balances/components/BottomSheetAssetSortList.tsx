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
}

export const BottomSheetAssetSortList = ({
  headerLabel,
  onCloseButtonPress,
  onButtonPress
}: BottomSheetAssetSortProps): React.MemoExoticComponent<() => JSX.Element> => memo(() => {
  const { isLight } = useThemeContext()
  const flatListComponents = {
    mobile: BottomSheetFlatList,
    web: ThemedFlatList
  }
  const FlatList = Platform.OS === 'web' ? flatListComponents.web : flatListComponents.mobile
  const assetSortList: string[] = ['Highest USD value', 'Lowest USD value', 'Highest Token Amount', 'Lowest Token Amount', 'A to Z', 'Z to A']

  const renderItem = ({
    item,
    index
  }: {
    item: string
    index: number
  }): JSX.Element => (
    <ThemedTouchableOpacity
      style={tailwind('px-4 py-3 ')}
    >
      <ThemedText
        testID={`${item}`}
        onPress={() => {
          onButtonPress(translate('screens/BalancesScreen', item))
        }}
      >
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
      data={assetSortList}
      renderItem={renderItem}
      ListHeaderComponent={headerComponent} // title of bottomsheet and close button
      style={tailwind({
        'bg-gray-800': !isLight,
        'bg-white': isLight
      })}
    />
  )
})
