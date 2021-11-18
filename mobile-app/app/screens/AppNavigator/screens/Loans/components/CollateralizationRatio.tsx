import React from 'react'
import BigNumber from 'bignumber.js'
import { ThemedText } from '@components/themed'
import { translate } from '@translations'
import NumberFormat from 'react-number-format'
import { tailwind } from '@tailwind'
import { useCollateralizationRatioColor } from '@hooks/wallet/CollateralizationRatioColor'

interface CollateralizationRatioProps {
  value: string
  minColRatio: string
}

export function CollateralizationRatio (props: CollateralizationRatioProps): JSX.Element {
  const collateralizationRatio = new BigNumber(props.value)
  const ratioThemedProps = useCollateralizationRatioColor({
    value: props.value,
    minColRatio: props.minColRatio
  })

  if (collateralizationRatio.isLessThan(0) || collateralizationRatio.isNaN()) {
    return (
      <ThemedText
        light={tailwind('text-gray-700')}
        dark={tailwind('text-gray-200')}
        style={tailwind('text-sm')}
      >
        {translate('components/CollateralizationRatio', 'N/A')}
      </ThemedText>
    )
  }

  return (
    <NumberFormat
      value={collateralizationRatio.toFixed(2)}
      decimalScale={2}
      suffix='%'
      displayType='text'
      renderText={value =>
        <ThemedText
          style={tailwind('text-sm')}
          {...ratioThemedProps}
        >
          {value}
        </ThemedText>}
    />
  )
}
