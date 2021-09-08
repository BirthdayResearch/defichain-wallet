import { MaterialIcons } from '@expo/vector-icons'
import { tailwind } from '@tailwind'
import React from 'react'
import { Text, View } from 'react-native'

interface InfoTextProp {
  text: string
}

export function InfoText (props: InfoTextProp): JSX.Element {
  return (
    <View style={tailwind('bg-warning-50')}>
      <MaterialIcons name='info' size={24} style={tailwind('text-warning-500')} />
      <Text style={tailwind('text-black')}>
        {props.text}
      </Text>
    </View>
  )
}
