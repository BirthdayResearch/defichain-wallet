import { StyleProp, View, ViewProps, ViewStyle } from 'react-native'
import NumberFormat from 'react-number-format'
import BigNumber from 'bignumber.js'
import { tailwind } from '@tailwind'
import { ThemedProps, ThemedText, ThemedTextV2, ThemedView } from './themed'
import { IconTooltip } from './tooltip/IconTooltip'
import { ActiveUSDValueV2 } from '@screens/AppNavigator/screens/Loans/VaultDetail/components/ActiveUSDValueV2'

type INumberRowProps = React.PropsWithChildren<ViewProps> & NumberRowProps

interface NumberRowProps extends ThemedProps {
  lhs: NumberRowElement
  rhs: RhsNumberRowElement
  containerStyle?: ThemedProps & { style: ThemedProps & StyleProp<ViewStyle> }
}

interface RhsNumberRowElement extends NumberRowElement {
  usdAmount?: BigNumber
  isOraclePrice?: boolean
  lightTextStyle?: { [key: string]: string }
  darkTextStyle?: { [key: string]: string }
  textStyle?: { [key: string]: string }
  usdTextStyle?: { [key: string]: string }
}

export interface NumberRowElement {
  value: string | number
  prefix?: string
  suffix?: string
  testID: string
  lightTextStyle?: { [key: string]: string }
  darkTextStyle?: { [key: string]: string }
}

export function NumberRowV2 (props: INumberRowProps): JSX.Element {
  return (
    <ThemedView
      {
      ...((props.containerStyle != null)
        ? props.containerStyle
        : {
          style: tailwind('flex-row items-start w-full')
        })}
    >
      <View style={tailwind('w-5/12')}>
        <View style={tailwind('flex-row items-end justify-start')}>
          <ThemedTextV2
            style={tailwind('text-sm font-normal-v2')}
            light={props.lhs.lightTextStyle}
            dark={props.lhs.darkTextStyle}
            testID={`${props.lhs.testID}_label`}
          >
            {props.lhs.value}
          </ThemedTextV2>
        </View>
      </View>

      <View style={tailwind('flex-1')}>
        <View>
          <View style={tailwind('flex flex-row justify-end flex-wrap items-center')}>
            <NumberFormat
              decimalScale={8}
              displayType='text'
              prefix={props.rhs.prefix}
              suffix={props.rhs.suffix !== undefined ? ` ${props.rhs.suffix}` : undefined}
              renderText={(val: string) => (
                <ThemedText
                  style={[tailwind('text-right font-normal-v2 text-sm'), props.rhs.textStyle]}
                  light={props.rhs.lightTextStyle}
                  dark={props.rhs.darkTextStyle}
                  testID={props.rhs.testID}
                >
                  {val}
                </ThemedText>
              )}
              thousandSeparator
              value={props.rhs.value}
            />
          </View>
        </View>
        <View style={tailwind('flex flex-row justify-end flex-wrap items-center')}>
          {
            props.rhs.usdAmount !== undefined &&
            (<ActiveUSDValueV2
              price={props.rhs.usdAmount}
              containerStyle={tailwind('justify-end pb-5')}
              testId={`${props.rhs.testID}_rhsUsdAmount`}
              style={props.rhs.usdTextStyle}
            />)
          }
          {
            props.rhs.isOraclePrice === true && (
              <IconTooltip />
            )
          }
        </View>
      </View>
    </ThemedView>
  )
}
