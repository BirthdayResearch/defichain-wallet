import { useNavigation } from '@react-navigation/native'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import tailwind from 'tailwind-rn'
import { Ionicons } from '@expo/vector-icons'
import { PrimaryColor } from '../../../constants/Colors'
import * as React from 'react'

export function WalletSetup (): JSX.Element {
  const navigator = useNavigation()

  return (
    <ScrollView style={tailwind('flex-1 bg-gray-100')}>
      <View style={tailwind('h-4')} />
      <WalletAddOptionRow
        onPress={() => navigator.navigate('')}
        text='Create new mnemonic wallet' icon='time'
      />
      <View style={tailwind('h-px bg-gray-100')} />
      <WalletAddOptionRow
        onPress={() => navigator.navigate('')}
        text='Restore mnemonic wallet' icon='document-text'
      />
    </ScrollView>
  )
}

function WalletAddOptionRow (props: { text: string, icon: string, onPress: () => void }): JSX.Element {
  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={tailwind('flex-row items-center justify-between px-4 bg-white')}
    >
      <View style={tailwind('flex-row items-center')}>
        <Ionicons name={props.icon as any} size={18} color={PrimaryColor} />
        <Text style={tailwind('font-medium ml-3 py-4')}>
          {props.text}
        </Text>
      </View>
      <View>
        <Ionicons name='chevron-forward' size={20} />
      </View>
    </TouchableOpacity>
  )
}
