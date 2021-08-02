import React from 'react'
import { TouchableOpacity } from 'react-native'
import { tailwind } from '../tailwind'
import { Text } from './Text'
import { translate } from '../translations'

interface SetAmountButtonProps {
  type: 'half' | 'max'
  onPress: (amount: string) => void
  amount: string
  label: '50%' | 'MAX'
}

export function SetAmountButton (props: SetAmountButtonProps): JSX.Element {
  return (
    <TouchableOpacity
      testID={`button_${props.type}_amount`}
      style={[
        tailwind('flex px-2 py-1.5 border border-gray-300 rounded'),
        props.type === 'half' && tailwind('mr-1')
      ]}
      onPress={() => {
        props.onPress(props.amount)
      }}
    >
      <Text style={tailwind('text-primary text-center font-medium')}>{translate('components/max', props.label)}</Text>
    </TouchableOpacity>
  )
}
