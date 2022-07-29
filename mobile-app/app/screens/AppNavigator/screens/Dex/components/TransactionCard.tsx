import { ThemedViewV2, ThemedTextV2, ThemedTouchableOpacityV2 } from '@components/themed'
import BigNumber from 'bignumber.js'
import { tailwind } from '@tailwind'
import { WalletTextInputV2 } from '@components/WalletTextInputV2'
import { translate } from '@translations'
import { getNativeIcon } from '@components/icons/assets'
import { StyleProp, ViewStyle } from 'react-native'

type EditingAmount = 'primary' | 'secondary'

interface TransactionCardProps {
  symbol: string
  balance: BigNumber
  current: string
  type: EditingAmount
  onChange: (amount: string) => void
}

export enum AmountButtonTypes {
  twenty = '20%',
  half = '50%',
  seventyFive = '75%',
  max = 'MAX'
}

export function TransactionCard(props: TransactionCardProps): JSX.Element {
  const Icon = getNativeIcon(props.symbol)
  return (
    <ThemedViewV2
      light={tailwind('bg-mono-light-v2-00')}
      dark={tailwind('bg-mono-dark-v2-00')}
      style={tailwind('rounded-lg-v2 px-4 py-4')}
    >
      <ThemedViewV2
        light={tailwind('border-mono-light-v2-300')}
        dark={tailwind('border-mono-dark-v2-300')}
        style={tailwind('flex flex-row items-center border-b-0.5 pb-2')}
      >
        <Icon height={20} width={20} />
        <WalletTextInputV2
          onChangeText={txt => props.onChange(txt)}
          placeholder={translate('screens/AddLiquidity', '0.00')}
          style={tailwind('flex-grow w-2/5')}
          testID={`token_input_${props.type}`}
          value={props.current}
          titleTestID={`token_input_${props.type}_title`}
          inputType='numeric'
          displayClearButton={props.current !== ''}
          onClearButtonPress={() => {
            props.onChange('')
          }}
        />
      </ThemedViewV2>

      <ThemedViewV2
        light={tailwind('bg-white')}
        style={tailwind('flex flex-row justify-around items-center pt-2')}
      >
        <SetAmountButton
          amount={props.balance}
          onPress={props.onChange}
          type={AmountButtonTypes.twenty}
          border
        />
        <SetAmountButton
          amount={props.balance}
          onPress={props.onChange}
          type={AmountButtonTypes.half}
          border
        />
        <SetAmountButton
          amount={props.balance}
          onPress={props.onChange}
          type={AmountButtonTypes.seventyFive}
          border
        />
        <SetAmountButton
          amount={props.balance}
          onPress={props.onChange}
          type={AmountButtonTypes.max}
        />
      </ThemedViewV2>
    </ThemedViewV2>

  )
}

interface SetAmountButtonProps {
  type: AmountButtonTypes
  onPress: (amount: string) => void
  amount: BigNumber
  customText?: string
  style?: StyleProp<ViewStyle>
  border?: boolean
}

function SetAmountButton(props: SetAmountButtonProps): JSX.Element {
  const decimalPlace = 8
  const text = props.customText !== undefined ? props.customText : translate('component/max', props.type)
  let value = props.amount.toFixed(decimalPlace)

  switch (props.type) {
    case (AmountButtonTypes.twenty):
      value = props.amount.multipliedBy(0.2).toFixed(decimalPlace)
      break
    case (AmountButtonTypes.half):
      value = props.amount.multipliedBy(0.5).toFixed(decimalPlace)
      break
    case (AmountButtonTypes.seventyFive):
      value = props.amount.multipliedBy(0.75).toFixed(decimalPlace)
      break
    case (AmountButtonTypes.max):
      value = props.amount.toFixed(decimalPlace)
      break
    default:
      break
  }

  return (
    <ThemedTouchableOpacityV2
      style={tailwind('border-0')}
      onPress={() => {
        props.onPress(value)
      }}
      testID={`${props.type}_amount_button`}
    >
      <ThemedViewV2
        light={tailwind('bg-mono-light-v2-00')}
        dark={tailwind('bg-mono-dark-v2-00')}
      >
        <ThemedTextV2
          light={tailwind('text-mono-light-v2-700')}
          dark={tailwind('text-mono-dark-v2-700')}
          style={tailwind('font-bold text-xs')}
        >
          {text}
        </ThemedTextV2>
      </ThemedViewV2>

    </ThemedTouchableOpacityV2>
  )
}