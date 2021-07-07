import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import ErrorBoundary from './ErrorBoundary/ErrorBoundary'
import { RootNavigator } from './RootNavigator'

export function Main (): JSX.Element {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <RootNavigator />
        <StatusBar />
      </SafeAreaProvider>
    </ErrorBoundary>
  )
}
