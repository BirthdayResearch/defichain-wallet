import { useNetInfo } from '@react-native-community/netinfo'

import { ThemedIcon, ThemedText, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'

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

      <ThemedText style={tailwind('text-sm pb-16 text-center opacity-60')}>
        {translate('screens/ConnectionBoundary', 'There seems to be a problem with the connection. Check your network and try again.')}
      </ThemedText>
    </ThemedView>
  )
}
