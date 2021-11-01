import { View } from '@components'
import { ThemedProps, ThemedText } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import React from 'react'
import NumberFormat from 'react-number-format'

interface VaultInfoProps {
  label: string
  value?: BigNumber
  prefix?: string
  suffix?: string
  decimalPlace: number
  valueThemedProps?: ThemedProps
}

export function VaultInfo (props: VaultInfoProps): JSX.Element {
  return (
    <View style={tailwind('w-2/4 mb-2')}>
      <ThemedText
        light={tailwind('text-gray-500')}
        dark={tailwind('text-gray-400')}
        style={tailwind('text-xs')}
      >
        {translate('components/VaultCard', props.label)}
      </ThemedText>
      <NumberFormat
        value={props.value?.toFixed(props.decimalPlace)}
        thousandSeparator
        decimalScale={2}
        displayType='text'
        suffix={props.suffix}
        prefix={props.prefix}
        renderText={value =>
          <ThemedText
            light={tailwind('text-gray-900')}
            dark={tailwind('text-gray-100')}
            {...props.valueThemedProps}
            style={tailwind('text-sm font-semibold')}
          >
            {value.length === 0 ? translate('components/VaultCard', 'n/a') : value}
          </ThemedText>}
      />
    </View>
  )
}
