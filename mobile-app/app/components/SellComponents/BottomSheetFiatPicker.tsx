import { memo } from 'react'
import * as React from 'react'
import { tailwind } from '@tailwind'
import { Platform, View } from 'react-native'
import { ThemedFlatList, ThemedIcon, ThemedText, ThemedTouchableOpacity } from '@components/themed'
import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { Fiat } from '@shared-api/dfx/models/Fiat'
import { Country } from '@shared-api/dfx/models/Country'

export type FiatType = 'EUR' | 'CHF' | 'USD' | 'GBP'

interface BottomSheetFiatPickerProps {
  onFiatPress: (fiatType: FiatType | Fiat['name'] | Country['name']) => void
  fiats?: Fiat[]
  paramData?: Country[]
  navigateToScreen?: {
    screenName: string
    onButtonPress: (fiatType: FiatType) => void // TODO necessary?
  }
}

export const BottomSheetFiatPicker = ({
  onFiatPress,
  fiats,
  paramData,
  navigateToScreen
}: BottomSheetFiatPickerProps): React.MemoExoticComponent<() => JSX.Element> => memo(() => {
  const { isLight } = useThemeContext()
  const flatListComponents = {
    mobile: BottomSheetFlatList,
    web: ThemedFlatList
  }
  const FlatList = Platform.OS === 'web' ? flatListComponents.web : flatListComponents.mobile

  const availableFiats: FiatType[] = ['EUR', 'USD', 'CHF', 'GBP']

  const liveFiats = fiats?.filter((item) => item.enable).map((item) => item.name)
  // TODO: refactor for generic use (-> UserDetailsScreen)
  const liveData = paramData?.filter((item) => item.enable).map((item) => item.name)
  const data = liveData ?? (liveFiats ?? availableFiats)

  return (
    <FlatList
      keyExtractor={(item) => item}
      style={tailwind({
        'bg-dfxblue-800': !isLight,
        'bg-white': isLight
      })}
      data={data}
      renderItem={({ item }: { item: FiatType | Fiat['name'] | Country['name']}) => (
        <FiatItem fiat={item} onPress={() => onFiatPress(item)} />
      )}
    />
  )
})

export function FiatItem (props: { fiat: FiatType | Fiat['name'], onPress: () => void}): JSX.Element {
  return (
    <ThemedTouchableOpacity
      onPress={props.onPress}
      dark={tailwind('bg-dfxblue-800 border-b border-dfxblue-900')}
      light={tailwind('border-gray-300 bg-white')}
      style={tailwind('px-4 py-3 flex flex-row items-center justify-between')}
      testID='select_fiatItem_input'
    >
      <View style={tailwind('flex flex-row items-center')}>
        <View style={tailwind('ml-2')}>
          <ThemedText>
            {props.fiat}
          </ThemedText>
        </View>
      </View>
      <View style={tailwind('flex flex-row items-center')}>
        <ThemedIcon iconType='MaterialIcons' name='chevron-right' size={20} />
      </View>
    </ThemedTouchableOpacity>
  )
}
