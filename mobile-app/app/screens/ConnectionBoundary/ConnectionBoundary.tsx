import NetInfo from '@react-native-community/netinfo'
import { ThemedIcon, ThemedText, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { Button } from '@components/Button'
import { useState, useEffect } from 'react'

export default function ConnectionBoundary (props: React.PropsWithChildren<any>): JSX.Element | null {
  const [isConnected, setIsConnected] = useState(true)

  const fetchNetInfo = async (): Promise<void> => {
    await NetInfo.fetch().then(state => {
      if (state.isConnected === true && state.isInternetReachable === true) {
        setIsConnected(true)
      } else {
        setIsConnected(false)
      }
    })
  }

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected === true && state.isInternetReachable === true) {
        setIsConnected(true)
      } else {
        setIsConnected(false)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return (
    !isConnected ? <ConnectionErrorComponent onPress={fetchNetInfo} /> : props.children
  )
}

function ConnectionErrorComponent ({ onPress }: { onPress: () => Promise<void> }): JSX.Element {
  return (
    <ThemedView
      style={tailwind('flex-1 items-center justify-center px-8')}
      testID='connection_error'
    >
      <ThemedIcon
        iconType='MaterialIcons'
        name='wifi-off'
        size={44}
        style={tailwind('pb-5 text-center')}
      />

      <ThemedText style={tailwind('text-2xl pb-2 font-semibold text-center')}>
        {translate('screens/ConnectionBoundary', 'Connection problem')}
      </ThemedText>

      <ThemedText style={tailwind('text-sm pb-9 text-center opacity-60')}>
        {translate('screens/ConnectionBoundary', 'There seems to be a problem with the connection. Check your network and try again.')}
      </ThemedText>

      <Button
        label={translate('screens/ConnectionBoundary', 'TRY AGAIN')}
        onPress={onPress}
        testID='button_check_connectivity'
        title='Try Again'
        margin='m-0 mb-4 w-48'
      />
    </ThemedView>
  )
}
