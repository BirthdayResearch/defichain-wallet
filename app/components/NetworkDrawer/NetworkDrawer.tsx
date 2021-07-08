import { MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import tailwind from 'tailwind-rn'
import { Text } from '..'
import { PrimaryColorStyle } from '../../constants/Theme'

export function NetworkDrawer (): JSX.Element {
  return (
    <View
      style={[tailwind('bg-white p-3 flex-row absolute w-full items-center border-t border-gray-200'), PrimaryButtonStyle.drawer]}
    >
      <View style={tailwind('mr-2')}>
        {/* <ActivityIndicator /> */}
        <MaterialIcons name='check-circle' size={24} color='#02B31B' />
      </View>
      <View style={tailwind('flex-grow mr-2 text-center')}>
        <Text style={tailwind('text-sm font-medium')}>Sending 1,000</Text>
        <Text style={tailwind('text-sm font-medium')}>aodihawoidawodowadjiawjdiowa</Text>
      </View>
      <TouchableOpacity
        onPress={() => {
        }}
        style={tailwind('px-2 py-1 rounded border border-gray-300 rounded flex-row justify-center items-center max-h-8')}
      >
        <Text style={[PrimaryColorStyle.text, tailwind('text-sm')]}>
          OK
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export const PrimaryButtonStyle = StyleSheet.create({
  drawer: {
    zIndex: 5,
    bottom: 50
  }
})
