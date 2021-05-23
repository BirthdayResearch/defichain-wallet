import React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import tailwind from 'tailwind-rn'

import useCachedResources from './hooks/useCachedResources'
import useColorScheme from './hooks/useColorScheme'
import Navigation from './navigation'

export default function App (): JSX.Element | null {
  const isLoadingComplete = useCachedResources()
  const colorScheme = useColorScheme()

  if (!isLoadingComplete) {
    return null
  }

  return (
    <View style={tailwind('flex-row flex-1 justify-center items-center')}>
      <View style={tailwind('flex-row border-2 border-gray-200')}>
        <View style={styles.phone}>
          <Navigation colorScheme={colorScheme} />
        </View>
        <View style={tailwind('border-l-2 border-gray-200')}>
          <Playground />
        </View>
      </View>
    </View>
  )
}

function Playground (): JSX.Element {
  return (
    <View>
      <View style={tailwind('p-4')}>
        <Text style={tailwind('text-lg font-bold')}>DeFi Wallet Preview & Playground</Text>
        <Text style={tailwind('mt-2')} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  phone: {
    width: 375,
    height: 667
  }
})
