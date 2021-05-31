import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { RootNavigator } from './RootNavigator'

export function Main (): JSX.Element {
  return (
    <SafeAreaProvider>
      <RootNavigator />
      <StatusBar />
    </SafeAreaProvider>
  )
}
