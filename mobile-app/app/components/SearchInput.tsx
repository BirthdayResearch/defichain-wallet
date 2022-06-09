import { StyleProp, TextInputProps, ViewStyle } from 'react-native'
import { ThemedIcon, ThemedTextInput, ThemedView } from '@components/themed'
import { ClearButton } from '@components/WalletTextInput'
import { tailwind } from '@tailwind'

type SearchInputProps = React.PropsWithChildren<TextInputProps> & ISearchInputProps

interface ISearchInputProps {
  showClearButton: boolean
  containerStyle?: StyleProp<ViewStyle>
  onClearInput: () => void
}

export function SearchInput (props: SearchInputProps): JSX.Element {
  const {
    onClearInput,
    containerStyle,
    ...otherProps
  } = props
  return (
    <ThemedView
      light={tailwind('bg-gray-100')}
      dark={tailwind('bg-dfxblue-800')}
      style={[tailwind('rounded-lg flex flex-row items-center py-1 pl-2'), props.containerStyle]}
    >
      <ThemedIcon
        iconType='MaterialIcons'
        name='search'
        size={16}
        light={tailwind('text-gray-600')}
        dark={tailwind('text-dfxgray-300')}
        style={tailwind('mr-2')}
      />
      <ThemedTextInput
        {...otherProps}
        style={[tailwind('flex-grow w-8/12 h-8'), tailwind({ 'mr-11': !props.showClearButton })]}
      />
      {props.showClearButton &&
        (
          <ClearButton
            onPress={onClearInput}
            iconThemedProps={{
              light: tailwind('text-dfxgray-300'),
              dark: tailwind('text-dfxblue-800')
            }}
          />
        )}
    </ThemedView>
  )
}
