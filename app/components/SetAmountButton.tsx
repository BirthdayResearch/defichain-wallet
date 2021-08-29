import BigNumber from 'bignumber.js'
import React from 'react'
import { tailwind } from '../tailwind'
import { translate } from '../translations'
import { ThemedText, ThemedTouchableOpacity } from './themed'

export enum AmountButtonTypes {
  half = '50%',
  max = 'MAX'
}

interface SetAmountButtonProps {
  type: AmountButtonTypes
  onPress: (amount: string) => void
  amount: BigNumber
}

export function SetAmountButton (props: SetAmountButtonProps): JSX.Element {
  const decimalPlace = 8

  return (
    <ThemedTouchableOpacity
      testID={`${props.type}_amount_button`}
      style={[
        tailwind('flex px-2 py-1.5 rounded'),
        props.type === AmountButtonTypes.half && tailwind('mr-1')
      ]}
      light={tailwind('border border-gray-300')}
      dark={tailwind('border border-gray-400')}
      onPress={() => {
        props.onPress(props.type === AmountButtonTypes.half ? props.amount.div(2).toFixed(decimalPlace) : props.amount.toFixed(decimalPlace))
      }}
    >
      <ThemedText
        light={tailwind('text-primary-500')}
        dark={tailwind('text-darkprimary-500')}
        style={tailwind('text-center font-medium')}
      >{translate('components/max', props.type)}
      </ThemedText>
    </ThemedTouchableOpacity>
  )
}
