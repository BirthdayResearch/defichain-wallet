import { MaterialIcons } from '@expo/vector-icons'
import { useNetInfo } from '@react-native-community/netinfo'
import React from 'react'
import { Text, View } from '../../components'
import { Button } from '../../components/Button'
import { tailwind } from '../../tailwind'
import { translate } from '../../translations'

export default function ConnectionBoundary (props: React.PropsWithChildren<any>): JSX.Element | null {
  const netInfo = useNetInfo()

  const onReload = (): void => {
    // do nothing because useNetInfo hook would have caused a re-render if connection changes
  }

  const noConnection = (): boolean => {
    return netInfo.isConnected === false || netInfo.isConnected === null
  }

  return (
    noConnection() ? <ConnectionErrorComponent onPress={onReload} /> : props.children
  )
}

function ConnectionErrorComponent (props: {onPress: () => void}): JSX.Element {
  return (
    <View
      testID='connection_error'
      style={tailwind('flex-1 items-center justify-center px-8')}
    >
      <MaterialIcons name='error' size={44} style={tailwind('pb-5 text-center text-black')} />
      <Text style={tailwind('text-2xl pb-2 font-semibold text-center')}>
        {translate('screens/ConnectionBoundary', 'Network error')}
      </Text>
      <Text style={tailwind('text-sm pb-16 text-center opacity-60')}>
        {translate('screens/ErrorBoundary', 'Please check your internet connection and try reloading this page after a few minutes')}
      </Text>
      <Button
        testID='button_reload'
        title='Reload'
        onPress={props.onPress}
        label={translate('screens/TransactionsScreen', 'RELOAD')}
      />
    </View>
  )
}
