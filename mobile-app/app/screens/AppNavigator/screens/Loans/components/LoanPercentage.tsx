import { Platform } from 'react-native'
import BigNumber from 'bignumber.js'
import * as Progress from 'react-native-progress'
import NumberFormat from 'react-number-format'
import { Text, View } from '@components'
import { ThemedText } from '@components/themed'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { getColor, tailwind } from '@tailwind'
import { translate } from '@translations'

interface LoanPercentageProps {
  amountToPayInPaymentToken: BigNumber
  loanTokenOutstandingBalance: BigNumber
  outstandingBalanceInPaymentToken: BigNumber
  amountToPayInLoanToken: BigNumber
  paymentTokenDisplaySymbol: string
  loanTokenDisplaySymbol: string
}

export function LoanPercentage ({
  amountToPayInLoanToken,
  amountToPayInPaymentToken,
  loanTokenOutstandingBalance,
  outstandingBalanceInPaymentToken,
  paymentTokenDisplaySymbol,
  loanTokenDisplaySymbol
}: LoanPercentageProps): JSX.Element {
  const { isLight } = useThemeContext()
  const textStyle = {
    style: tailwind('text-sm'),
    light: tailwind('text-gray-500'),
    dark: tailwind('text-gray-400')
  }
  return (
    <View style={tailwind('mx-4 pt-1', {
      'mt-4': Platform.OS !== 'web'
    })}
    >
      <Text style={tailwind('mb-4')}>
        <ThemedText {...textStyle}>{`${translate('screens/PaybackLoanScreen', 'You are paying')} `}</ThemedText>
        <NumberFormat
          decimalScale={2}
          displayType='text'
          renderText={(value) =>
            <ThemedText
              style={tailwind('text-sm font-bold')}
              light={tailwind('text-gray-900')}
              dark={tailwind('text-gray-50')}
              testID='loan_payment_percentage'
            >
              {`${value}%`}
            </ThemedText>}
          thousandSeparator
          value={amountToPayInPaymentToken.gt(0) ? amountToPayInPaymentToken.dividedBy(outstandingBalanceInPaymentToken).multipliedBy(100).toFixed(2) : '0'}
        />
        <ThemedText {...textStyle}>{` ${translate('screens/PaybackLoanScreen', 'of total loan')}`}</ThemedText>
      </Text>
      <Progress.Bar
        progress={amountToPayInPaymentToken.gt(0) ? Number(amountToPayInPaymentToken.dividedBy(outstandingBalanceInPaymentToken)) : 0}
        width={null}
        borderColor={getColor(isLight ? 'gray-300' : 'gray-600')}
        color={getColor(isLight ? 'blue-500' : 'blue-500')}
        unfilledColor='gray-100'
        borderRadius={8}
        height={8}
      />
      <View style={tailwind('flex flex-row justify-between items-center mt-2')}>
        <ThemedText
          style={tailwind('text-2xs')}
          light={tailwind('text-gray-500')}
          dark={tailwind('text-gray-400')}
        >{translate('screens/PaybackLoanScreen', '0%')}
        </ThemedText>
        {
          amountToPayInPaymentToken.gt(0) &&
            <ThemedText
              style={tailwind('text-xs')}
              light={tailwind('text-gray-900')}
              dark={tailwind('text-gray-50')}
            >{
              paymentTokenDisplaySymbol !== loanTokenDisplaySymbol
                ? `${amountToPayInPaymentToken.toFixed(8)} ${paymentTokenDisplaySymbol} ≈ ${amountToPayInLoanToken.toFixed(8)} ${loanTokenDisplaySymbol}`
                : `${amountToPayInPaymentToken.toFixed(8)} ${loanTokenDisplaySymbol} / ${loanTokenOutstandingBalance.toFixed(8)}`
            }
            </ThemedText>
        }
        <ThemedText
          style={tailwind('text-2xs')}
          light={tailwind('text-gray-500')}
          dark={tailwind('text-gray-400')}
        >{translate('screens/PaybackLoanScreen', '100%')}
        </ThemedText>
      </View>
    </View>
  )
}
