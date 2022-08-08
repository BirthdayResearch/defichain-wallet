import { tailwind } from '@tailwind'
import { View, StyleProp, TextProps } from 'react-native'
import { ThemedTextV2, ThemedProps } from '@components/themed'
import NumberFormat from 'react-number-format'

interface ViewPoolAmountRowProps {
    label?: string
    labelTextStyle?: StyleProp<TextProps>
    labelThemeProps?: ThemedProps
    valueTextStyle?: StyleProp<TextProps>
    valueThemeProps?: ThemedProps
    amount: string
    testID: string
    prefix?: string
    suffix?: string
  }

export function ViewPoolAmountRow ({
    label = '',
    labelTextStyle,
    labelThemeProps = {
      dark: tailwind('text-mono-dark-v2-500'),
      light: tailwind('text-mono-light-v2-500')
    },
    valueTextStyle,
    valueThemeProps = {
      dark: tailwind('text-mono-dark-v2-900'),
      light: tailwind('text-mono-light-v2-900')
    },
    amount,
    testID,
    prefix,
    suffix
  }: ViewPoolAmountRowProps): JSX.Element {
    return (
      <View style={tailwind('flex-row justify-between items-start')}>
        <ThemedTextV2
          light={labelThemeProps.light}
          dark={labelThemeProps.dark}
          style={[tailwind('text-sm font-normal-v2'), labelTextStyle]}
        >
          {label}
        </ThemedTextV2>
        <View style={tailwind('flex-row flex-1 justify-end')}>
          <NumberFormat
            value={amount}
            thousandSeparator
            displayType='text'
            prefix={prefix}
            suffix={suffix}
            renderText={value =>
              <ThemedTextV2
                light={valueThemeProps.light}
                dark={valueThemeProps.dark}
                style={[tailwind('text-sm font-normal-v2'), valueTextStyle]}
                testID={`${testID}_amount`}
              >
                {value}
              </ThemedTextV2>}
          />
        </View>
      </View>
    )
}
