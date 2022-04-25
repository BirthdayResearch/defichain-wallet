import { View } from '@components'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { Platform, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SearchInput } from './SearchInput'
import { ThemedIcon, ThemedView } from './themed'

interface HeaderSearchInputProps {
  searchString: string
  onClearInput: () => void
  onChangeInput: (text: string) => void
  onCancelPress: () => void
  placeholder: string
  testID?: string
}

export function HeaderSearchInput (props: HeaderSearchInputProps): JSX.Element {
  const safeAreaInsets = useSafeAreaInsets()
  return (
    <ThemedView
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-gray-800 border-gray-700')}
      style={[
        tailwind('flex flex-row items-center pb-2 px-4'),
        {
          paddingTop: Platform.OS === 'android' ? safeAreaInsets.top + 8 : safeAreaInsets.top - 4
        }
      ]}
    >
      <SearchInput
        value={props.searchString}
        placeholder={translate('components/HeaderSearchInput', props.placeholder)}
        autoFocus
        showClearButton={props.searchString !== ''}
        onClearInput={props.onClearInput}
        onChangeText={props.onChangeInput}
        testID={props.testID}
      />
      <View style={tailwind('flex justify-center ml-2')}>
        <TouchableOpacity testID={`${props.testID ?? 'search_dex_bar'}_close`} onPress={props.onCancelPress}>
          <ThemedIcon
            light={tailwind('text-primary-500')}
            dark={tailwind('text-darkprimary-500')}
            iconType='MaterialCommunityIcons'
            name='close'
            size={24}
          />
        </TouchableOpacity>
      </View>
    </ThemedView>
  )
}
