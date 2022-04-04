
import { StyleProp, TextStyle, View, TextProps, ViewStyle } from 'react-native'
import { tailwind } from '@tailwind'
import { ThemedProps, ThemedText, ThemedView } from './themed'
import { BottomSheetAlertInfo, BottomSheetInfo } from './BottomSheetInfo'

interface HSProps extends TextProps {
  value: string
  testID: string
  themedProps?: ThemedProps
}
interface TextRowProps {
  lhs: string | HSProps
  rhs: HSProps
  info?: BottomSheetAlertInfo
  textStyle?: StyleProp<TextStyle>
  containerStyle?: ThemedProps & { style: ThemedProps & StyleProp<ViewStyle> }
}

export function TextRow (props: TextRowProps): JSX.Element {
  const { themedProps, testID, value, ...otherProps } = props.rhs
  return (
    <ThemedView
      {
      ...((props.containerStyle != null)
        ? props.containerStyle
        : {
          dark: tailwind('bg-gray-800 border-b border-gray-700'),
          light: tailwind('bg-white border-b border-gray-200'),
          style: tailwind('p-4 flex-row items-start w-full')
        })}
    >
      <View style={tailwind('w-6/12')}>
        <View style={tailwind('flex-row items-center justify-start')}>
          <ThemedText
            style={[tailwind('font-medium'), props.textStyle]}
            {...(typeof (props.lhs) !== 'string') && props.lhs.themedProps}
          >
            {typeof (props.lhs) === 'string' ? props.lhs : props.lhs.value}
          </ThemedText>
          {(props.info != null) && (
            <View style={tailwind('ml-1')}>
              <BottomSheetInfo alertInfo={props.info} name={props.info.title} infoIconStyle={[tailwind('font-medium'), props.textStyle]} />
            </View>
          )}
        </View>
      </View>

      <View style={tailwind('flex-1')}>
        <ThemedText
          dark={tailwind('text-gray-400')}
          light={tailwind('text-gray-500')}
          {...themedProps}
          style={[tailwind('font-medium text-right'), props.textStyle]}
          testID={testID}
          {...otherProps}
        >
          {value}
        </ThemedText>
      </View>
    </ThemedView>
  )
}
