import { ThemedViewV2, ThemedTextV2, ThemedTouchableOpacityV2 } from '@components/themed'
import BigNumber from 'bignumber.js'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { useState } from 'react'

interface PercentageCardProps {
  maxValue: BigNumber
  onChange: (amount: string, type: AmountButtonTypes) => void
  status?: 'error' | 'active'
}

export enum AmountButtonTypes {
  twentyFive = '25%',
  half = '50%',
  seventyFive = '75%',
  max = 'MAX'
}

export function PercentageCard ({ maxValue, onChange, status, children }: React.PropsWithChildren<PercentageCardProps>): JSX.Element {
  // const [isFocus, setIsFocus] = useState(false)
  return (
    <ThemedViewV2
      light={tailwind('bg-mono-light-v2-00', {
        'border-0.5 border-mono-light-v2-800': status === 'active',
        'border-0.5 border-red-v2': status === 'error'
      })}
      dark={tailwind('bg-mono-dark-v2-00', {
        'border-0.5 border-mono-dark-v2-800': status === 'active'
      })}
      style={tailwind('rounded-2xl-v2', {
        'border-0.5 border-red-v2': status === 'error'
      })}
    >
      <ThemedViewV2
        light={tailwind('bg-mono-light-v2-00')}
        dark={tailwind('bg-mono-dark-v2-00')}
        style={tailwind('px-5 pt-2 rounded-t-2xl-v2 bg-red-200')}
      >
        {children}
      </ThemedViewV2>
      <ThemedViewV2
        light={tailwind('border-mono-light-v2-300')}
        dark={tailwind('border-mono-dark-v2-300')}
        style={tailwind('flex flex-row justify-around items-center pt-2 pb-4 border-t-0.5')}
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
        onPress(value, type)
      }}
      testID={`${type}_amount_button`}
    >
      <ThemedViewV2
        light={tailwind('border-mono-light-v2-300')}
        dark={tailwind('border-mono-light-v2-300')}
        style={tailwind({ 'border-r-0.5': hasBorder })}
      >
        <ThemedTextV2
          light={tailwind('text-mono-light-v2-700')}
          dark={tailwind('text-mono-dark-v2-700')}
          style={tailwind('font-bold text-xs px-6')}
        >
          {translate('component/max', type)}
        </ThemedTextV2>
      </ThemedViewV2>
    </ThemedTouchableOpacityV2>
  )
}
