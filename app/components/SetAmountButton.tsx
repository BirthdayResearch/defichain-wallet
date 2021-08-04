import BigNumber from 'bignumber.js'
import React from 'react'
import { TouchableOpacity } from 'react-native'
import { tailwind } from '../tailwind'
import { translate } from '../translations'
import { Text } from './Text'

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
    <TouchableOpacity
      testID={`${props.type}_amount_button`}
      style={[
        tailwind('flex px-2 py-1.5 border border-gray-300 rounded'),
        props.type === AmountButtonTypes.half && tailwind('mr-1')
      ]}
      onPress={() => {
        props.onPress(props.type === AmountButtonTypes.half ? props.amount.div(2).toFixed(decimalPlace) : props.amount.toFixed(decimalPlace))
      }}
    >
      <Text style={tailwind('text-primary text-center font-medium')}>{translate('components/max', props.type)}</Text>
    </TouchableOpacity>
  )
}
