import { TouchableOpacity, View } from 'react-native'
import { tailwind } from '@tailwind'
import { ThemedIcon, ThemedSectionTitle, ThemedText, ThemedTouchableOpacity } from '@components/themed'
import { getNativeIcon } from '@components/icons/assets'
import { PaymentTokenProps } from '../screens/PaybackLoanScreen'
import { translate } from '@translations'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { LoanParamList } from '../LoansNavigator'

interface PaymentTokenCardsProps {
  testID?: string
  paymentTokens: Array<{
    displaySymbol: string
    isSelected: boolean
    paymentToken: PaymentTokenProps
  }>
  onPaymentTokenSelect: (paymentToken: PaymentTokenProps) => void
  selectedPaymentTokenSymbol: string
}

export function PaymentTokenCards ({
  paymentTokens,
  onPaymentTokenSelect,
  selectedPaymentTokenSymbol
}: PaymentTokenCardsProps): JSX.Element {
  const navigation = useNavigation<NavigationProp<LoanParamList>>()
  return (
    <>
      <ThemedSectionTitle
        light={tailwind('text-gray-700')}
        dark={tailwind('text-gray-200')}
        style={tailwind('text-base mx-4 my-2')}
        text={translate('screens/PaybackLoanScreen', 'Select payment token')}
      />
      <View
        style={tailwind('flex flex-row justify-center mx-2')}
      >
        {paymentTokens.map((paymentTokenOption) => (
          <PaymentTokenCard
            key={paymentTokenOption.paymentToken.tokenId}
            onPress={onPaymentTokenSelect}
            {...paymentTokenOption}
          />
        ))}
      </View>
      {selectedPaymentTokenSymbol === 'DFI' &&
        (
          <View style={tailwind('flex flex-row mx-3 ml-2 p-1 flex-wrap')}>
            <ThemedText
              light={tailwind('text-gray-500')}
              dark={tailwind('text-gray-200')}
              style={tailwind('text-xs m-2')}
              testID='text_penalty_fee_warning'
            >
              {translate('screens/PaybackLoanScreen', 'A 1% fee is applied when you pay with DFI.')}
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
  displaySymbol: string
  isSelected: boolean
  paymentToken: PaymentTokenProps
  onPress: (paymentToken: PaymentTokenProps) => void
}

function PaymentTokenCard (props: PaymentTokenCardProps): JSX.Element {
  const Icon = getNativeIcon(props.displaySymbol)
  return (
    <ThemedTouchableOpacity
      testID={`payment_token_card_${props.displaySymbol}`}
      light={tailwind({
        'bg-white border-gray-200': !props.isSelected,
        'bg-white border-primary-500': props.isSelected
      })}
      dark={tailwind({
        'bg-gray-800 border-gray-700': !props.isSelected,
        'bg-gray-800 border-darkprimary-500': props.isSelected
      })}
      style={tailwind('p-3 mx-2 rounded border flex-1 flex-row items-center')}
      onPress={() => props.onPress(props.paymentToken)}
    >
      <Icon width={30} height={30} style={tailwind('mr-2')} />
      <View>
        <ThemedText
          testID={`payment_token_card_${props.displaySymbol}_display_symbol`}
          style={tailwind('font-medium')}
        >{props.displaySymbol}
        </ThemedText>
      </View>
    </ThemedTouchableOpacity>
  )
}
