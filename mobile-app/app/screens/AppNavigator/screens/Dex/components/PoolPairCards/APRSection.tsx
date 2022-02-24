import { memo } from 'react'
import { View } from 'react-native'
import NumberFormat from 'react-number-format'
import { isEqual } from 'lodash'
import { tailwind } from '@tailwind'
import { ThemedText } from '@components/themed'

interface APRSectionProps {
  label: string
  value: {
    decimalScale: number
    suffix?: string
    testID: string
    text: string
  }
}

export const APRSection = memo((props: APRSectionProps): JSX.Element => {
  return (
    <View
      style={tailwind(
        'flex flex-1 py-1 px-2 items-center border border-gray-200 rounded'
      )}
    >
      <ThemedText
        dark={tailwind('text-gray-400')}
        light={tailwind('text-gray-500')}
        style={tailwind('text-xs font-normal')}
      >
        {props.label}
      </ThemedText>
      <NumberFormat
        decimalScale={props.value.decimalScale}
        displayType='text'
        renderText={(value) => (
          <ThemedText
            style={tailwind('text-sm font-semibold')}
            light={tailwind('text-success-600')}
            dark={tailwind('text-darksuccess-600')}
            testID={props.value.testID}
          >
            {value}
          </ThemedText>
        )}
        thousandSeparator
        suffix={props.value.suffix}
        value={props.value.text}
      />
    </View>
  )
}, isEqual)
