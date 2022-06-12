import { memo } from 'react'
import * as React from 'react'
import { tailwind } from '@tailwind'
import { Platform, View } from 'react-native'
import { ThemedFlatList, ThemedIcon, ThemedText, ThemedTouchableOpacity } from '@components/themed'
import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { Fiat } from '@shared-api/dfx/models/Fiat'
import { Country } from '@shared-api/dfx/models/Country'

// export type FiatType = 'EUR' | 'CHF' | 'USD' | 'GBP'

interface BottomSheetFiatPickerProps {
  onFiatPress: (fiatType: Fiat) => void
  onCloseModal: () => void
  fiats?: Fiat[]
  paramData?: Country[]
}

export const BottomSheetFiatPicker = ({
  onFiatPress,
  onCloseModal,
  fiats,
  paramData
}: BottomSheetFiatPickerProps): React.MemoExoticComponent<() => JSX.Element> => memo(() => {
  const { isLight } = useThemeContext()
  const flatListComponents = {
    mobile: BottomSheetFlatList,
    web: ThemedFlatList
  }
  const FlatList = Platform.OS === 'web' ? flatListComponents.web : flatListComponents.mobile

  const liveFiats = fiats?.filter((item) => item.enable)
  // TODO: refactor for generic use (-> UserDetailsScreen)
  // const liveData = paramData?.filter((item) => item.enable).map((item) => item.name)
  // const data = liveData ?? liveFiats
  const data = liveFiats
  data ?? onCloseModal()

  return (
    <FlatList
      keyExtractor={(item) => item.id}
      style={tailwind({
        'bg-dfxblue-800': !isLight,
        'bg-white': isLight
      })}
      data={data}
      renderItem={({ item }: { item: Fiat }) => (
        <ListItem item={item.name} onPress={() => onFiatPress(item)} />
      )}
    />
  )
})

export function ListItem (props: { item: Fiat['name'] | Country['name'], onPress: () => void}): JSX.Element {
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
            {props.item}
          </ThemedText>
        </View>
      </View>
      <View style={tailwind('flex flex-row items-center')}>
        <ThemedIcon iconType='MaterialIcons' name='chevron-right' size={20} />
      </View>
    </ThemedTouchableOpacity>
  )
}
