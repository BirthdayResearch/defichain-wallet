import { ThemedIcon, ThemedTextInput, ThemedView } from '@components/themed'
import { ClearButton } from '@components/WalletTextInput'
import { tailwind } from '@tailwind'

import { TextInputProps } from 'react-native'

type SearchInputProps = React.PropsWithChildren<TextInputProps> & ISearchInputProps

interface ISearchInputProps {
  showClearButton: boolean
  onClearInput: () => void
}

export function SearchInput (props: SearchInputProps): JSX.Element {
  const {
    onClearInput,
    ...otherProps
  } = props
  return (
    <ThemedView
      light={tailwind('bg-gray-100')}
      dark={tailwind('bg-gray-900')}
      style={tailwind('rounded-lg flex flex-row items-center py-1 pl-2 flex-1')}
    >
      <ThemedIcon
        iconType='MaterialIcons'
        name='search'
        size={16}
        light={tailwind('text-gray-600')}
        dark={tailwind('text-gray-300')}
        style={tailwind('mr-2')}
      />
      <ThemedTextInput
        {...otherProps}
        style={tailwind('flex-grow w-8/12 h-8')}
      />
      {props.showClearButton &&
        (
          <ClearButton
            onPress={onClearInput}
            iconThemedProps={{
              light: tailwind('text-gray-300'),
              dark: tailwind('text-gray-600')
            }}
          />
        )}
    </ThemedView>
  )
}
