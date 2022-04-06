import { TouchableOpacity, View } from 'react-native'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import BigNumber from 'bignumber.js'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { ThemedIcon, ThemedSectionTitle, ThemedText, ThemedTouchableOpacity } from '@components/themed'
import { getNativeIcon } from '@components/icons/assets'
import { LoanParamList } from '../LoansNavigator'
import { PaymentTokenProps } from '../hooks/LoanPaymentTokenRate'
import { useFeatureFlagContext } from '@contexts/FeatureFlagContext'

interface PaymentTokenCardsProps {
  testID?: string
  paymentTokens: Array<{
    isSelected: boolean
    paymentToken: PaymentTokenProps
    resultingBalance?: BigNumber
    amountToPayInPaymentToken?: BigNumber
    amountToPayInLoanToken?: BigNumber
  }>
  onPaymentTokenSelect: (paymentToken: PaymentTokenProps) => void
  selectedPaymentTokenSymbol: string
  loanTokenSymbol: string
}

export function PaymentTokenCards ({
  paymentTokens,
  onPaymentTokenSelect,
  selectedPaymentTokenSymbol,
  loanTokenSymbol
}: PaymentTokenCardsProps): JSX.Element {
  const { isFeatureAvailable } = useFeatureFlagContext()
  const isDUSDPaymentEnabled = isFeatureAvailable('dusd_loan_payment')
  const navigation = useNavigation<NavigationProp<LoanParamList>>()
  return (
    <>
      <ThemedSectionTitle
        light={tailwind('text-gray-700')}
        dark={tailwind('text-gray-200')}
        style={tailwind('text-base mx-4 my-2')}
        text={translate('screens/PaybackLoanScreen', 'How do you want to pay?')}
      />
      <View
        style={tailwind('flex flex-row justify-center mx-2')}
      >
        {paymentTokens.map((paymentTokenOption) => {
          return (
            <PaymentTokenCard
              key={paymentTokenOption.paymentToken.tokenId}
              onPress={onPaymentTokenSelect}
              disabled={
                !isDUSDPaymentEnabled &&
                loanTokenSymbol !== 'DUSD' &&
                paymentTokenOption.paymentToken.tokenSymbol === 'DUSD'
              }
              {...paymentTokenOption}
            />
          )
        })}
      </View>
      {(selectedPaymentTokenSymbol === 'DFI' || (selectedPaymentTokenSymbol === 'DUSD' && loanTokenSymbol !== 'DUSD')) &&
        (
          <View style={tailwind('flex flex-row mx-3 ml-2 p-1 flex-wrap')}>
            <ThemedText
              light={tailwind('text-gray-500')}
              dark={tailwind('text-gray-200')}
              style={tailwind('text-xs m-2')}
              testID='text_penalty_fee_warning'
            >
              {translate('screens/PaybackLoanScreen', 'A 1% fee is applied when you pay with {{tokenSymbol}}.', { tokenSymbol: selectedPaymentTokenSymbol })}
              <TouchableOpacity
                onPress={() => navigation.navigate({
                  name: 'LoansFaq',
                  params: {
                    activeSessions: [5]
                  }
                })}
              >
                <View style={tailwind('flex flex-row items-center relative -bottom-0.5 ml-1')}>
                  <ThemedIcon
                    iconType='MaterialIcons'
                    name='help'
                    size={14}
                    dark={tailwind('text-darkprimary-500')}
                    light={tailwind('text-primary-500')}
                  />
                  <ThemedText
                    dark={tailwind('text-darkprimary-500')}
                    light={tailwind('text-primary-500')}
                    style={tailwind('text-xs mx-1')}
                  >{translate('screens/PaybackLoanScreen', 'Read more')}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            </ThemedText>
          </View>
        )}
    </>
  )
}

interface PaymentTokenCardProps {
  isSelected: boolean
  paymentToken: PaymentTokenProps
  onPress: (paymentToken: PaymentTokenProps) => void
  disabled: boolean
}

function PaymentTokenCard (props: PaymentTokenCardProps): JSX.Element {
  const Icon = getNativeIcon(props.paymentToken.tokenDisplaySymbol)
  return (
    <ThemedTouchableOpacity
      testID={`payment_token_card_${props.paymentToken.tokenDisplaySymbol}`}
      light={tailwind({
        'bg-white border-gray-200': !props.isSelected,
        'bg-white border-primary-500': props.isSelected,
        'bg-gray-100 border-0': props.disabled

      })}
      dark={tailwind({
        'bg-gray-800 border-gray-700': !props.isSelected,
        'bg-gray-800 border-darkprimary-500': props.isSelected,
        'bg-gray-900 text-gray-500 border-0': props.disabled
      })}
      style={tailwind('p-3 mx-2 rounded border flex-1 flex-row items-center')}
      onPress={() => props.onPress(props.paymentToken)}
      disabled={props.disabled}
    >
      <Icon width={24} height={24} style={tailwind('mr-2')} />
      <View>
        <ThemedText
          testID={`payment_token_card_${props.paymentToken.tokenDisplaySymbol}_display_symbol`}
          light={tailwind({
            'text-gray-500': !props.disabled,
            'text-gray-300': props.disabled
          })}
          dark={tailwind({
            'text-gray-400': !props.disabled,
            'text-gray-600': props.disabled
          })}
          style={tailwind('font-medium')}
        >{props.paymentToken.tokenDisplaySymbol}
        </ThemedText>
      </View>
    </ThemedTouchableOpacity>
  )
}
