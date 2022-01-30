
import { StyleProp, TextStyle, View, TextProps } from 'react-native'
import { tailwind } from '@tailwind'
import { ThemedProps, ThemedText, ThemedView } from './themed'
import { BottomSheetAlertInfo, BottomSheetInfo } from './BottomSheetInfo'

interface RHSProps extends TextProps {
  value: string
  testID: string
  themedProps?: ThemedProps
}
interface TextRowProps {
  lhs: string
  rhs: RHSProps
  info?: BottomSheetAlertInfo
  textStyle?: StyleProp<TextStyle>
}

export function TextRow (props: TextRowProps): JSX.Element {
  const { themedProps, testID, value, ...otherProps } = props.rhs
  return (
    <ThemedView
      dark={tailwind('bg-dfxblue-800 border-b border-dfxblue-900')}
      light={tailwind('bg-white border-b border-gray-200')}
      style={tailwind('p-4 flex-row items-start w-full')}
    >
      <View style={tailwind('w-6/12')}>
        <View style={tailwind('flex-row items-center justify-start')}>
          <ThemedText style={[tailwind('font-medium'), props.textStyle]}>
            {props.lhs}
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
          dark={tailwind('text-dfxgray-400')}
          light={tailwind('text-dfxgray-500')}
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
