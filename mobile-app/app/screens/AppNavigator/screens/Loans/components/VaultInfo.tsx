import { View } from '@components'
import { ThemedProps, ThemedText } from '@components/themed'
import { TokenIconGroup } from '@components/TokenIconGroup'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import React from 'react'
import NumberFormat from 'react-number-format'

interface VaultInfoProps {
  label: string
  value?: BigNumber
  tokens?: string[]
  valueType: VaultInfoValueType
  prefix?: string
  suffix?: string
  decimalPlace?: number
  valueThemedProps?: ThemedProps
}

type VaultInfoValueType = 'NUMBER' | 'TOKEN_ICON_GROUP'

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
      {props.valueType === 'NUMBER' &&
        (
          <NumberFormat
            value={props.value?.toFixed()}
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
        )}
      {props.valueType === 'TOKEN_ICON_GROUP' && props.tokens !== undefined &&
        (
          <View style={tailwind('mt-0.5')}>
            <TokenIconGroup symbols={props.tokens} maxDisplay={5} />
          </View>
        )}

    </View>
  )
}
