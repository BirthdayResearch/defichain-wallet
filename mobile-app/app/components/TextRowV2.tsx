
import { StyleProp, View, TextProps, ViewStyle } from 'react-native'
import { tailwind } from '@tailwind'
import { ThemedProps, ThemedText, ThemedView } from './themed'

interface TextRowElement extends TextProps {
  value: string
  testID?: string
  themedProps?: ThemedProps
}
interface TextRowProps {
  lhs: TextRowElement
  rhs: TextRowElement
  containerStyle?: ThemedProps & { style: ThemedProps & StyleProp<ViewStyle> }
}

export function TextRowV2 (props: TextRowProps): JSX.Element {
  const { themedProps, testID, value, ...otherProps } = props.rhs

  return (
    <ThemedView
      {
      ...((props.containerStyle != null)
        ? props.containerStyle
        : {
          style: tailwind('flex-row items-start w-full bg-transparent'),
          light: tailwind('bg-transparent'),
          dark: tailwind('bg-transparent')
        })}
    >
      <View style={tailwind('w-5/12')}>
        <View style={tailwind('flex-row items-center justify-start')}>
          <ThemedText
            style={tailwind('text-sm font-normal-v2')}
            light={tailwind('text-mono-light-v2-900')}
            dark={tailwind('text-mono-dark-v2-900')}
            {...(typeof (props.lhs) !== 'string') && props.lhs.themedProps}
          >
            {typeof (props.lhs) === 'string' ? props.lhs : props.lhs.value}
          </ThemedText>
        </View>
      </View>

      <View style={tailwind('flex-1')}>
        <ThemedText
          style={tailwind('text-right font-normal-v2 text-sm')}
          light={tailwind('text-mono-light-v2-700')}
          dark={tailwind('text-mono-dark-v2-700')}
          testID={testID}
          {...themedProps}
          {...otherProps}
        >
          {value}
        </ThemedText>
      </View>
    </ThemedView>
  )
}
