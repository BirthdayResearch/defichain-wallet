
import BigNumber from 'bignumber.js'
import { ThemedText } from '@components/themed'
import { translate } from '@translations'
import NumberFormat from 'react-number-format'
import { tailwind } from '@tailwind'
import { useCollateralizationRatioColor } from '@screens/AppNavigator/screens/Loans/hooks/CollateralizationRatio'

interface CollateralizationRatioProps {
  colRatio: BigNumber
  minColRatio: BigNumber
  totalLoanAmount: BigNumber
}

export function CollateralizationRatio (props: CollateralizationRatioProps): JSX.Element {
  const ratioThemedProps = useCollateralizationRatioColor({
    colRatio: props.colRatio,
    minColRatio: props.minColRatio,
    totalLoanAmount: props.totalLoanAmount
  })

  if (props.colRatio.isLessThan(0) || props.colRatio.isNaN()) {
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
      value={props.colRatio.toFixed(2)}
      decimalScale={2}
      suffix='%'
      displayType='text'
      thousandSeparator
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
