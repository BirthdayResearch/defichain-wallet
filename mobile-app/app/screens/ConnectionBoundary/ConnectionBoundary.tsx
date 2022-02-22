import { useNetInfo, fetch } from '@react-native-community/netinfo'

import { ThemedIcon, ThemedText, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { Button } from '@components/Button'

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
  const checkConnectivity = (): void => {
    void fetch()
  }
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
        onPress={checkConnectivity}
        testID='button_check_connectivity'
        title='Try Again'
        margin='m-0 mb-4 w-48'
      />
    </ThemedView>
  )
}
