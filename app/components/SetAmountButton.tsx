import React from 'react'
import { TouchableOpacity } from 'react-native'
import { tailwind } from '../tailwind'
import { Text } from './Text'
import { translate } from '../translations'
import BigNumber from 'bignumber.js'

interface SetAmountButtonProps {
  type: 'half' | 'max'
  onPress: (amount: string) => void
  amount: BigNumber
}

export function SetAmountButton (props: SetAmountButtonProps): JSX.Element {
  const decimalPlace = 8

  return (
    <TouchableOpacity
      testID={`button_${props.type}_amount`}
      style={[
        tailwind('flex px-2 py-1.5 border border-gray-300 rounded'),
        props.type === 'half' && tailwind('mr-1')
      ]}
      onPress={() => {
        props.onPress(props.type === 'half' ? props.amount.div(2).toFixed(decimalPlace) : props.amount.toFixed(decimalPlace))
      }}
    >
      <Text style={tailwind('text-primary text-center font-medium')}>{translate('components/max', props.type === 'half' ? '50%' : 'MAX')}</Text>
    </TouchableOpacity>
  )
}
