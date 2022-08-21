import { ThemedViewV2, ThemedTextV2, ThemedTouchableOpacityV2 } from '@components/themed'
import BigNumber from 'bignumber.js'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { StyleProp, ViewStyle } from 'react-native'

interface TransactionCardProps {
  maxValue: BigNumber
  onChange: (amount: string, type: AmountButtonTypes) => void
  status?: TransactionCardStatus
  containerStyle?: StyleProp<ViewStyle>
  amountButtonsStyle?: StyleProp<ViewStyle>
}

export enum AmountButtonTypes {
  TwentyFive = '25%',
  Half = '50%',
  SeventyFive = '75%',
  Max = 'MAX'
}

export enum TransactionCardStatus {
  Default,
  Active,
  Error
}

export function TransactionCard ({
  maxValue,
  onChange,
  status,
  containerStyle,
  amountButtonsStyle,
  children
}: React.PropsWithChildren<TransactionCardProps>): JSX.Element {
  return (
    <ThemedViewV2
      light={tailwind('bg-mono-light-v2-00', {
        'border-0.5 border-mono-light-v2-800': status === TransactionCardStatus.Active
      })}
      dark={tailwind('bg-mono-dark-v2-00', {
        'border-0.5 border-mono-dark-v2-800': status === TransactionCardStatus.Active
      })}
      style={tailwind('rounded-lg-v2', {
        'border-0.5 border-red-v2': status === TransactionCardStatus.Error
      })}
    >
      <ThemedViewV2
        light={tailwind('bg-mono-light-v2-00')}
        dark={tailwind('bg-mono-dark-v2-00')}
        style={containerStyle}
      >
        {children}
      </ThemedViewV2>
      <ThemedViewV2
        light={tailwind('border-mono-light-v2-300')}
        dark={tailwind('border-mono-dark-v2-300')}
        style={[tailwind('flex flex-row justify-around items-center py-2.5'), amountButtonsStyle]}
      >
        {
          Object.values(AmountButtonTypes).map((type, index, { length }) => {
            return (
              <SetAmountButton
                key={type}
                amount={maxValue}
                onPress={onChange}
                type={type}
                hasBorder={length - 1 !== index}
              />
            )
          })
        }
      </ThemedViewV2>
    </ThemedViewV2>
  )
}

interface SetAmountButtonProps {
  type: AmountButtonTypes
  onPress: (amount: string, type: AmountButtonTypes) => void
  amount: BigNumber
  hasBorder?: boolean
}

function SetAmountButton ({
  type,
  onPress,
  amount,
  hasBorder
}: SetAmountButtonProps): JSX.Element {
  const decimalPlace = 8
  let value = amount.toFixed(decimalPlace)

  switch (type) {
    case (AmountButtonTypes.TwentyFive):
      value = amount.multipliedBy(0.25).toFixed(decimalPlace)
      break
    case (AmountButtonTypes.Half):
      value = amount.multipliedBy(0.5).toFixed(decimalPlace)
      break
    case (AmountButtonTypes.SeventyFive):
      value = amount.multipliedBy(0.75).toFixed(decimalPlace)
      break
    case (AmountButtonTypes.Max):
      value = amount.toFixed(decimalPlace)
      break
  }

  return (
    <ThemedTouchableOpacityV2
      style={tailwind('border-0')}
      onPress={() => {
        onPress(value, type)
      }}
      testID={`${type}_amount_button`}
    >
      <ThemedViewV2
        light={tailwind('border-mono-light-v2-300')}
        dark={tailwind('border-mono-dark-v2-300')}
        style={tailwind({ 'border-r-0.5': hasBorder })}
      >
        <ThemedTextV2
          light={tailwind('text-mono-light-v2-700')}
          dark={tailwind('text-mono-dark-v2-700')}
          style={tailwind('font-semibold-v2 text-xs px-7')}
        >
          {translate('component/max', type)}
        </ThemedTextV2>
      </ThemedViewV2>
    </ThemedTouchableOpacityV2>
  )
}
