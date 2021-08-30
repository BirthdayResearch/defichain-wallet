import { useNetInfo } from '@react-native-community/netinfo'
import React from 'react'
import { ThemedIcon, ThemedText, ThemedView } from '../../components/themed'
import { tailwind } from '../../tailwind'
import { translate } from '../../translations'

export default function ConnectionBoundary (props: React.PropsWithChildren<any>): JSX.Element | null {
  const netInfo = useNetInfo()
  const noConnection = (): boolean => {
    return netInfo.isConnected === false
  }

  return (
    noConnection() ? <ConnectionErrorComponent /> : props.children
  )
}

function ConnectionErrorComponent (): JSX.Element {
  return (
    <ThemedView
      testID='connection_error'
      style={tailwind('flex-1 items-center justify-center px-8')}
    >
      <ThemedIcon iconType='MaterialIcons' name='error' size={44} style={tailwind('pb-5 text-center')} />
      <ThemedText style={tailwind('text-2xl pb-2 font-semibold text-center')}>
        {translate('screens/ConnectionBoundary', 'Network error')}
      </ThemedText>
      <ThemedText style={tailwind('text-sm pb-16 text-center opacity-60')}>
        {translate('screens/ConnectionBoundary', 'Please check your internet connection and try again')}
      </ThemedText>
    </ThemedView>
  )
}
