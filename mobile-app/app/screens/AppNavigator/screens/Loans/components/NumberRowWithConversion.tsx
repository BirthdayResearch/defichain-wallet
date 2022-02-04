import { StyleProp, TextStyle, View, ViewProps, Text } from 'react-native'
import NumberFormat from 'react-number-format'
import { tailwind } from '@tailwind'
import { ThemedProps, ThemedView, ThemedText } from '@components/themed'
import { BottomSheetAlertInfo, BottomSheetInfo } from '@components/BottomSheetInfo'

type INumberRowProps = React.PropsWithChildren<ViewProps> & NumberRowWithConversionProps
export type SuffixType = 'text' | 'component'

interface NumberRowWithConversionProps extends ThemedProps {
  lhs: string
  rhs: NumberRowElement
  rhsConversion?: NumberRowElement
  info?: BottomSheetAlertInfo
  textStyle?: StyleProp<TextStyle>
}

export interface NumberRowElement {
  value: string | number
  suffix?: string
  testID: string
  suffixType?: SuffixType
  prefix?: string
  style?: StyleProp<ViewProps>
}

export function NumberRowWithConversion (props: INumberRowProps): JSX.Element {
  const rhsStyle = [tailwind('text-sm text-right w-full'), props.textStyle, props.rhs.style]
  return (
    <ThemedView
      dark={props.dark ?? tailwind('bg-gray-800 border-b border-gray-700')}
      light={props.light ?? tailwind('bg-white border-b border-gray-200')}
      style={props.style ?? tailwind('p-4 flex-row w-full')}
    >
      <View style={tailwind('w-6/12 self-center')}>
        <View style={tailwind('flex-row items-end justify-start')}>
          <ThemedText
            style={[tailwind('text-sm'), props.textStyle]}
            testID={`${props.rhs.testID}_label`}
          >
            {props.lhs}
          </ThemedText>
          {(props.info != null) && (
            <View style={tailwind('ml-1')}>
              <BottomSheetInfo
                alertInfo={props.info} name={props.info.title}
                infoIconStyle={[tailwind('text-sm'), props.textStyle]}
              />
            </View>
          )}
        </View>
      </View>

      <View
        style={tailwind('flex-1 flex-col justify-end flex-wrap items-end')}
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

        {props.rhsConversion !== undefined &&
          <NumberFormat
            decimalScale={8}
            displayType='text'
            prefix={props.rhsConversion.prefix}
            renderText={(val: string) => (
              <Text style={rhsStyle}>
                {props.rhsConversion === undefined
                  ? ''
                  : (
                    <>
                      <ThemedText light={tailwind('text-gray-500')} dark={tailwind('text-gray-400')}>(</ThemedText>
                      <ThemedText
                        dark={tailwind('text-gray-400')}
                        light={tailwind('text-gray-500')}
                        style={rhsStyle}
                        testID={props.rhsConversion.testID}
                      >
                        {val}
                      </ThemedText>
                      {
                        props.rhsConversion.suffixType === 'text' &&
                          <>
                            <Text>{' '}</Text>
                            <ThemedText
                              light={tailwind('text-gray-500')}
                              dark={tailwind('text-gray-400')}
                              style={[tailwind('text-sm ml-1'), props.textStyle, props.rhsConversion.style]}
                              testID={`${props.rhsConversion.testID}_suffix`}
                            >
                              {props.rhsConversion.suffix}
                            </ThemedText>
                          </>
                      }
                      <ThemedText light={tailwind('text-gray-500')} dark={tailwind('text-gray-400')}>)</ThemedText>
                    </>)}
              </Text>
            )}
            thousandSeparator
            value={props.rhsConversion.value}
          />}
      </View>
    </ThemedView>
  )
}
