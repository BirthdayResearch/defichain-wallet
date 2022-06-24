import { StyleProp, View, ViewProps, ViewStyle } from 'react-native'
import NumberFormat from 'react-number-format'
import BigNumber from 'bignumber.js'
import { tailwind } from '@tailwind'
import { ThemedProps, ThemedText, ThemedView } from './themed'
import { ActiveUSDValue } from '@screens/AppNavigator/screens/Loans/VaultDetail/components/ActiveUSDValue'
import { IconTooltip } from './tooltip/IconTooltip'

type INumberRowProps = React.PropsWithChildren<ViewProps> & NumberRowProps

interface NumberRowProps extends ThemedProps {
  lhs: NumberRowElement
  rhs: rhsNumberRowElement
  containerStyle?: ThemedProps & { style: ThemedProps & StyleProp<ViewStyle> }
}

interface rhsNumberRowElement extends NumberRowElement {
  usdAmount?: BigNumber
  isOraclePrice?: boolean
}

export interface NumberRowElement {
  value: string | number
  prefix?: string
  suffix?: string
  testID: string
}

export function NumberRowV2 (props: INumberRowProps): JSX.Element {
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
        <View style={tailwind('flex-row items-end justify-start')}>
          <ThemedText
            style={tailwind('text-sm font-normal-v2')}
            light={tailwind('text-mono-light-v2-900')}
            dark={tailwind('text-mono-dark-v2-900')}
            testID={`${props.lhs.testID}_label`}
          >
            {props.lhs.value}
          </ThemedText>
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
                  style={tailwind('text-right font-normal-v2 text-sm')}
                  light={tailwind('text-mono-light-v2-700')}
                  dark={tailwind('text-mono-dark-v2-700')}
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
              <ActiveUSDValue
                price={props.rhs.usdAmount}
                containerStyle={tailwind('justify-end')}
                testId={`${props.rhs.testID}_rhsUsdAmount`}
              />
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
