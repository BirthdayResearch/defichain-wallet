import * as React from 'react'
import { useNavigation } from '@react-navigation/native'
import { ScrollView, View } from 'react-native'
import tailwind from 'tailwind-rn'

export function WalletMnemonicRestoreWord (): JSX.Element {
  const navigator = useNavigation()

  return (
    <ScrollView style={tailwind('flex-1 bg-gray-100')}>
      <View style={tailwind('h-4')} />

    </ScrollView>
  )
}
