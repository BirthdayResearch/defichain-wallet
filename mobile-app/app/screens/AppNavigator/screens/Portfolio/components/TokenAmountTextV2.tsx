import { tailwind } from '@tailwind'
import { View } from '@components'
import NumberFormat from 'react-number-format'
import BigNumber from 'bignumber.js'
import { BalanceTextV2 } from './BalanceTextV2'
import { ActiveUSDValueV2 } from '../../Loans/VaultDetail/components/ActiveUSDValueV2'
import { useDisplayBalancesContext } from '@contexts/DisplayBalancesContext'
import { ThemedTextV2 } from '@components/themed'

interface TokenAmountTextProps {
  testID: string
  usdAmount: BigNumber
  tokenAmount: string
  denominationCurrency: string
}

export function TokenAmountTextV2 ({
  testID,
  usdAmount,
  tokenAmount,
  denominationCurrency
}: TokenAmountTextProps): JSX.Element {
  const { isBalancesDisplayed, hiddenBalanceText } = useDisplayBalancesContext()

  return (
    <NumberFormat
      decimalScale={8}
      displayType='text'
      renderText={(value) =>
        <>
          <View style={tailwind('flex')}>
            <BalanceTextV2
              containerStyle={tailwind('justify-end')}
              style={tailwind('text-sm font-semibold-v2 flex-wrap mb-1 text-right')}
              testID={`${testID}_amount`}
              value={value}
            />
            {isBalancesDisplayed
              ? (
                <ActiveUSDValueV2
                  testId={`${testID}_usd_amount`}
                  price={usdAmount}
                  style={tailwind('text-right')}
                  containerStyle={tailwind('justify-end')}
                  denominationCurrency={denominationCurrency}
                />
              )
              : (
                <ThemedTextV2
                  style={tailwind('text-xs font-normal-v2 text-right')}
                  dark={tailwind('text-mono-dark-v2-700')}
                  light={tailwind('text-mono-dark-v2-700')}
                  testID={`${testID}_usd_amount`}
                >
                  {hiddenBalanceText}
                </ThemedTextV2>
              )}
          </View>
        </>}
      thousandSeparator
      value={new BigNumber(tokenAmount).toFixed(8)}
    />
  )
}
