import { memo } from 'react'
import * as React from 'react'
import { tailwind } from '@tailwind'
import { Platform, TouchableOpacity } from 'react-native'
import { ThemedFlatList, ThemedIcon, ThemedText, ThemedView } from '@components/themed'
import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { Country } from '@shared-api/dfx/models/Country'
import { ListItem } from './BottomSheetFiatPicker'
import { translate } from '@translations'

interface BottomSheetCountryPickerProps {
  onItemPress: (country: Country) => void
  onCloseButtonPress?: () => void
  countries: Country[]
  navigateToScreen?: {
    screenName: string
    onButtonPress: (country: Country) => void // TODO necessary?
  }
}

export const BottomSheetCountryPicker = ({
  onItemPress,
  countries,
  navigateToScreen,
  onCloseButtonPress
}: BottomSheetCountryPickerProps): React.MemoExoticComponent<() => JSX.Element> => memo(() => {
  const { isLight } = useThemeContext()
  const flatListComponents = {
    mobile: BottomSheetFlatList,
    web: ThemedFlatList
  }
  const FlatList = Platform.OS === 'web' ? flatListComponents.web : flatListComponents.mobile

  const filterEnabled = (countryList: Country[]): Country[] => {
    return countryList?.filter((item) => {
      return item.enable
    })
  }

  const filteredList = filterEnabled(countries)

  return (

    <FlatList
      keyExtractor={(item) => item.id}
      style={tailwind({
          'bg-dfxblue-800': !isLight,
          'bg-white': isLight
        })}
      data={filteredList}
      renderItem={({ item }: { item: Country }) => (
        <ListItem item={item.name} onPress={() => onItemPress(item)} />
        )}
      ListHeaderComponent={
        <ThemedView
          light={tailwind('bg-white border-gray-200')}
          dark={tailwind('bg-dfxblue-800 border-dfxblue-900')}
          style={tailwind('flex flex-row justify-between items-center px-4 py-2 border-b', { 'py-3.5 border-t -mb-px': Platform.OS === 'android' })}
        >
          <ThemedText
            style={tailwind('text-lg font-medium')}
          >
            {translate('screens/UserDetails', 'Country')}
          </ThemedText>
          <TouchableOpacity onPress={onCloseButtonPress}>
            <ThemedIcon iconType='MaterialIcons' name='close' size={20} />
          </TouchableOpacity>
        </ThemedView>
        }
      stickyHeaderIndices={[0]}
    />
      // <TouchableOpacity onPress={onCloseButtonPress}>
      //   <ThemedIcon iconType='MaterialIcons' name='close' size={20} />
      // </TouchableOpacity>
      // <ThemedFlatList
      //   // keyExtractor={(item) => item.id}
      //   style={tailwind({
      //     'bg-dfxblue-800': !isLight,
      //     'bg-white': isLight
      //   })}
      //   data={filteredList}
      //   renderItem={({ item }: { item: Country }) => (
      //     <FiatItem fiat={'TFL: ' + item.name} onPress={() => onItemPress(item)} />
      //   )}
      // />
      // <FiatItem fiat={filteredList?.at(0)?.name ?? 'Land'} onPress={() => onItemPress(filteredList?.at(0) ?? testCountry)} />
      // <TouchableOpacity onPress={onCloseButtonPress}>
      //   <ThemedIcon iconType='MaterialIcons' name='close' size={20} />
      // </TouchableOpacity>
      // BottomSheetFlatList
      // <FlatList
      //   keyExtractor={(item) => item}
      //   style={tailwind({
      //     'bg-dfxblue-800': !isLight,
      //     'bg-white': isLight
      //   })}
      //   data={xList}
      //   renderItem={({ item }: { item: string }) => (
      //     <FiatItem fiat={item} onPress={() => onItemPress(testCountry)} />
      //   )}
      // />
  )
})
