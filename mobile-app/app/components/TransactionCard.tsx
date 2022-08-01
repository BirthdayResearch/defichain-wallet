import { ThemedTextV2, ThemedTouchableOpacityV2, ThemedViewV2 } from '@components/themed'
import BigNumber from 'bignumber.js'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { View } from '@components'

interface TransactionCardProps {
  maxValue: BigNumber
  onChange: (amount: string) => void
  status?: 'error' | 'active'
}

export enum AmountButtonTypes {
  twentyFive = '25%',
  half = '50%',
  seventyFive = '75%',
  max = 'MAX'
}

export function TransactionCard ({
  maxValue,
  onChange,
  status,
  children
}: React.PropsWithChildren<TransactionCardProps>): JSX.Element {
  return (
    <ThemedViewV2
      light={tailwind('bg-mono-light-v2-00', {
        'border-0.5 border-mono-light-v2-800': status === 'active',
        'border-0.5 border-red-v2': status === 'error'
      })}
      dark={tailwind('bg-mono-dark-v2-00', {
        'border-0.5 border-mono-dark-v2-800': status === 'active'
      })}
      style={tailwind('rounded-lg-v2 p-5', {
        'border-0.5 border-red-v2': status === 'error'
      })}
    >
      {children}
      <View
        style={tailwind('flex flex-row bg-transparent justify-around items-center pt-2')}
      >
        {
          [AmountButtonTypes.twentyFive, AmountButtonTypes.half, AmountButtonTypes.seventyFive, AmountButtonTypes.max].map((type, index, { length }) => {
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
      </View>
    </ThemedViewV2>
  )
}

interface SetAmountButtonProps {
  type: AmountButtonTypes
  onPress: (amount: string) => void
  amount: BigNumber
  hasBorder?: boolean
}

function SetAmountButton ({
  type,
  onPress,
  amount
  // hasBorder,
}: SetAmountButtonProps): JSX.Element {
  const decimalPlace = 8
  let value = amount.toFixed(decimalPlace)

  switch (type) {
    case (AmountButtonTypes.twentyFive):
      value = amount.multipliedBy(0.25).toFixed(decimalPlace)
      break
    case (AmountButtonTypes.half):
      value = amount.multipliedBy(0.5).toFixed(decimalPlace)
      break
    case (AmountButtonTypes.seventyFive):
      value = amount.multipliedBy(0.75).toFixed(decimalPlace)
      break
    case (AmountButtonTypes.max):
      value = amount.toFixed(decimalPlace)
      break
  }

  return (
    <ThemedTouchableOpacityV2
      style={tailwind('border-0')}
      onPress={() => {
        onPress(value)
      }}
      testID={`${type}_amount_button`}
    >
      <ThemedTextV2
        light={tailwind('text-mono-light-v2-700')}
        dark={tailwind('text-mono-dark-v2-700')}
        style={tailwind('font-bold text-xs')}
      >
        {translate('component/max', type)}
      </ThemedTextV2>
    </ThemedTouchableOpacityV2>
  )
}
