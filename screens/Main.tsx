import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { RootNavigator } from './RootNavigator'
import ErrorBoundary from './ErrorBoundary/ErrorBoundary'

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
