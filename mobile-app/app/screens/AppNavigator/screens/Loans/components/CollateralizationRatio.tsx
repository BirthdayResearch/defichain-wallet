import React from 'react'
import BigNumber from 'bignumber.js'
import { ThemedProps, ThemedText } from '@components/themed'
import { translate } from '@translations'
import NumberFormat from 'react-number-format'
import { tailwind } from '@tailwind'

interface CollateralizationRatioProps {
  value: string
  minColRatio: string
}

export function CollateralizationRatio (props: CollateralizationRatioProps): JSX.Element {
  const collateralizationRatio = new BigNumber(props.value)
  const getTextThemedProps = (): ThemedProps => {
    const style: ThemedProps = {}
    const atRiskThreshold = new BigNumber(props.minColRatio).plus(150)
    const liquidatedThreshold = new BigNumber(props.minColRatio).plus(50)

    if (collateralizationRatio.isLessThan(liquidatedThreshold)) {
      style.light = tailwind('text-error-500')
      style.dark = tailwind('text-darkerror-500')
    } else if (collateralizationRatio.isLessThan(atRiskThreshold)) {
      style.light = tailwind('text-warning-500')
      style.dark = tailwind('text-darkwarning-500')
    } else {
      style.light = tailwind('text-success-500')
      style.dark = tailwind('text-darksuccess-500')
    }
    return style
  }

  if (collateralizationRatio.isLessThan(0)) {
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
          {...getTextThemedProps()}
        >
          {value}
        </ThemedText>}
    />
  )
}
