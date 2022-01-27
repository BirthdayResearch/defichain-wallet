import { tailwind } from '@tailwind'
import { View } from '@components'
import NumberFormat from 'react-number-format'
import { BalanceText } from '@screens/AppNavigator/screens/Balances/components/BalanceText'
import { ActiveUSDValue } from '@screens/AppNavigator/screens/Loans/VaultDetail/components/ActiveUSDValue'
import BigNumber from 'bignumber.js'

export function TokenAmountText ({
  testID,
  isBalancesDisplayed,
  usdAmount,
  tokenAmount
}: { testID: string, isBalancesDisplayed: boolean, usdAmount: BigNumber, tokenAmount: string }): JSX.Element {
  return (
    <View style={tailwind('flex-row items-center')}>
      <NumberFormat
        decimalScale={8}
        displayType='text'
        renderText={(value) =>
          <>
            <View style={tailwind('flex leading-6')}>
              <BalanceText
                dark={tailwind('text-gray-200')}
                light={tailwind('text-black')}
                style={tailwind('flex-wrap')}
                testID={`${testID}_amount`}
                value={value}
              />
              {isBalancesDisplayed && (
                <ActiveUSDValue
                  testId={`${testID}_usd_amount`}
                  price={usdAmount}
                  containerStyle={tailwind('justify-end')}
                />
              )}
            </View>
          </>}
        thousandSeparator
        value={new BigNumber(tokenAmount).toFixed(8)}
      />
    </View>
  )
}
