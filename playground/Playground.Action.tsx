import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import tailwind from 'tailwind-rn'

export function PlaygroundAction (props: {
  testID: string
  title: string
  onPress: () => void
}): JSX.Element {
  return (
    <TouchableOpacity
      style={tailwind('flex-row items-center justify-between py-3')}
      onPress={props.onPress}
      testID={props.testID}
    >
      <Text style={tailwind('flex-1 text-sm font-medium text-gray-900')}>
        {props.title}
      </Text>
      <View style={tailwind('px-4')} />
      <View>
        <Ionicons name='chevron-forward' size={24} />
      </View>
    </TouchableOpacity>
  )
}
