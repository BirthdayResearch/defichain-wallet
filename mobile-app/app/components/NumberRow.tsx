import { StyleProp, TextStyle, View, ViewProps, Text } from 'react-native'
import NumberFormat from 'react-number-format'
import { tailwind } from '@tailwind'
import { ThemedProps, ThemedText, ThemedView } from './themed'
import { BottomSheetAlertInfo, BottomSheetInfo } from './BottomSheetInfo'

type INumberRowProps = React.PropsWithChildren<ViewProps> & NumberRowProps
export type SuffixType = 'text' | 'component'

interface NumberRowProps extends ThemedProps {
  lhs: string
  rhs: NumberRowElement
  info?: BottomSheetAlertInfo
  textStyle?: StyleProp<TextStyle>
  lhsThemedProps?: ThemedProps // TODO: change lhs to type NumberRowElement, move themedprops into NumberRowElement
  rhsThemedProps?: ThemedProps
}

export interface NumberRowElement {
  value: string | number
  suffix?: string
  testID: string
  suffixType?: SuffixType
  prefix?: string
  style?: StyleProp<ViewProps>
}

export function NumberRow (props: INumberRowProps): JSX.Element {
  const rhsStyle = [tailwind('text-sm text-right'), props.textStyle, props.rhs.style]
  return (
    <ThemedView
      dark={props.dark ?? tailwind('bg-gray-800 border-b border-gray-700')}
      light={props.light ?? tailwind('bg-white border-b border-gray-200')}
      style={props.style ?? tailwind('p-4 flex-row items-start w-full')}
    >
      <View style={tailwind('w-6/12')}>
        <View style={tailwind('flex-row items-end justify-start')}>
          <ThemedText
            style={[tailwind('text-sm'), props.textStyle]}
            testID={`${props.rhs.testID}_label`}
            {...props.lhsThemedProps}
          >
            {props.lhs}
          </ThemedText>
          {(props.info != null) && (
            <View style={tailwind('ml-1')}>
              <BottomSheetInfo alertInfo={props.info} name={props.info.title} infoIconStyle={[tailwind('text-sm'), props.textStyle]} />
            </View>
          )}
        </View>
      </View>

      <View
        style={tailwind('flex-1 flex-row justify-end flex-wrap items-center')}
      >
        <NumberFormat
          decimalScale={8}
          displayType='text'
          prefix={props.rhs.prefix}
          renderText={(val: string) => (
            <Text style={rhsStyle}>
              <ThemedText
                dark={tailwind('text-gray-400')}
                light={tailwind('text-gray-500')}
                style={rhsStyle}
                testID={props.rhs.testID}
                {...props.rhsThemedProps}
              >
                {val}
              </ThemedText>
              {
                props.rhs.suffixType === 'text' &&
                  <>
                    <Text>{' '}</Text>
                    <ThemedText
                      light={tailwind('text-gray-500')}
                      dark={tailwind('text-gray-400')}
                      style={[tailwind('text-sm ml-1'), props.textStyle, props.rhs.style]}
                      testID={`${props.rhs.testID}_suffix`}
                      {...props.rhsThemedProps}
                    >
                      {props.rhs.suffix}
                    </ThemedText>
                  </>
              }
            </Text>
          )}
          thousandSeparator
          value={props.rhs.value}
        />

        {
          props.rhs.suffixType === 'component' &&
          (props.children)
        }
      </View>
    </ThemedView>
  )
}
