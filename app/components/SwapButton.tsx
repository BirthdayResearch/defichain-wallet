import * as React from 'react'
import { MaterialIcons } from '@expo/vector-icons'
import { View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { tailwind } from '../tailwind'

interface SwapButtonProps {
  onPress: () => void
}

export function SwapButton (props: SwapButtonProps): JSX.Element {
  return (
    <View style={tailwind('flex-row justify-center items-center mt-6')}>
      <TouchableOpacity
        testID='button_convert_mode_toggle'
        style={tailwind('border border-gray-300 rounded bg-white p-1')}
        onPress={props.onPress}
      >
        <MaterialIcons name='swap-vert' size={24} style={tailwind('text-primary')} />
      </TouchableOpacity>
    </View>
  )
}
