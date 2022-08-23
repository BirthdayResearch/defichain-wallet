import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SearchInputV2 } from './SearchInputV2'
import { ThemedIcon, ThemedViewV2 } from './themed'

interface HeaderSearchInputProps {
  searchString: string
  onClearInput: () => void
  onChangeInput: (text: string) => void
  onCancelPress: () => void
  placeholder: string
  testID?: string
}

export function HeaderSearchInputV2 (props: HeaderSearchInputProps): JSX.Element {
  const safeAreaInsets = useSafeAreaInsets()
  return (
    <ThemedViewV2
      light={tailwind('bg-mono-light-v2-00')}
      dark={tailwind('bg-mono-dark-v2-00')}
      style={[
        tailwind('flex flex-row items-center pl-3 pr-5 pb-0.5'),
        {
          paddingTop: safeAreaInsets.top + 14
        }
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        testID={`${props.testID ?? 'search_dex_bar'}_close`}
        onPress={props.onCancelPress}
        style={tailwind('mr-4')}
      >
        <ThemedIcon
          light={tailwind('text-mono-light-v2-900')}
          dark={tailwind('text-mono-dark-v2-900')}
          iconType='Feather'
          name='chevron-left'
          size={24}
        />
      </TouchableOpacity>
      <SearchInputV2
        light={tailwind('bg-mono-light-v2-100')}
        dark={tailwind('bg-mono-dark-v2-100')}
        inputStyle={{
          light: tailwind('text-mono-light-v2-900'),
          dark: tailwind('text-mono-dark-v2-900')
        }}
        containerStyle={tailwind('flex-1')}
        value={props.searchString}
        placeholder={translate('components/HeaderSearchInput', props.placeholder)}
        autoFocus
        showClearButton={props.searchString !== ''}
        onClearInput={props.onClearInput}
        onChangeText={props.onChangeInput}
        testID={props.testID}
      />
    </ThemedViewV2>
  )
}
