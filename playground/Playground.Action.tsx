import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import tailwind from 'tailwind-rn'
import { Ionicons } from '@expo/vector-icons'

export function PlaygroundAction (props: {
  testID: string
  title: string
  onPress: () => void
}): JSX.Element {
  return (
    <TouchableOpacity
      style={tailwind('flex-row items-center justify-between py-2 border-b border-gray-100')}
      onPress={props.onPress}
      testID={props.testID}
    >
      <Text style={tailwind('text-xs font-medium text-gray-900')}>
        {props.title}
      </Text>
      <View style={tailwind('px-4')} />
      <View style={tailwind('p-1')}>
        <Ionicons size={18} name='caret-forward-outline' />
      </View>
    </TouchableOpacity>
  )
}
