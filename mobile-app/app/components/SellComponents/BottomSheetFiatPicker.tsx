import { memo } from 'react'
import * as React from 'react'
import { tailwind } from '@tailwind'
import { Platform, View } from 'react-native'
import { ThemedFlatList, ThemedIcon, ThemedText, ThemedTouchableOpacity } from '@components/themed'
import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { useThemeContext } from '@shared-contexts/ThemeProvider'

export type FiatType = 'EUR' | 'CHF' | 'USD' | 'GBP'

interface BottomSheetFiatAccountCreateProps {
  onFiatPress: (fiatType: FiatType) => void
  navigateToScreen?: {
    screenName: string
    onButtonPress: (fiatType: FiatType) => void // TODO necessary?
  }
}

export const BottomSheetFiatPicker = ({
  onFiatPress,
  navigateToScreen
}: BottomSheetFiatAccountCreateProps): React.MemoExoticComponent<() => JSX.Element> => memo(() => {
  const { isLight } = useThemeContext()
  const flatListComponents = {
    mobile: BottomSheetFlatList,
    web: ThemedFlatList
  }
  const FlatList = Platform.OS === 'web' ? flatListComponents.web : flatListComponents.mobile
  const availableFiats: FiatType[] = ['EUR', 'USD', 'CHF', 'GBP']

  return (
    <FlatList
      keyExtractor={(item) => item}
      style={tailwind({
        'bg-dfxblue-800': !isLight,
        'bg-white': isLight
      })}
      data={availableFiats}
      renderItem={({ item }: { item: FiatType }) => (
        <FiatItem fiat={item} onPress={() => onFiatPress(item)} />
      )}
    />
  )
})

function FiatItem (props: {fiat: FiatType, onPress: () => void}): JSX.Element {
  return (
    <ThemedTouchableOpacity
      onPress={props.onPress}
      dark={tailwind('bg-dfxblue-800 border-dfxblue-900')}
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
