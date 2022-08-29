// TODO: (thabrad) reactivate ADS
/* eslint-disable @typescript-eslint/no-unused-vars */
import { WalletContextProvider } from '@shared-contexts/WalletContext'
import { WalletNodeProvider } from '@shared-contexts/WalletNodeProvider'
import { useWalletPersistenceContext } from '@shared-contexts/WalletPersistenceContext'
import { AppNavigator } from './AppNavigator/AppNavigator'
import { PrivacyLock } from './PrivacyLock'
import { TransactionAuthorization } from './TransactionAuthorization/TransactionAuthorization'
import { WalletNavigator } from './WalletNavigator/WalletNavigator'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { WalletAddressIndexPersistence } from '@api/wallet/address_index'
import { StyleSheet, Image, View } from 'react-native'
import { ThemedTouchableOpacity, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { Text } from '@components'
import { useShowAdvertisement } from '@hooks/useShowAdvertisement'
import { useState } from 'react'
import { MaterialIcons } from '@expo/vector-icons'
import { WalletDataProvider } from '@shared-contexts/WalletDataProvider'

/**
 * Top Root Level Wallet State to control what screen to show
 */
export function RootNavigator (): JSX.Element {
  const {
    wallets,
    isLoaded
  } = useWalletPersistenceContext()

  // TODO: (thabrad) reactivate ads
  // DFX advertisement display
  const [skipped, setSkipped] = useState(false)
  const { showAd, counter, adUrl } = useShowAdvertisement()
  if (showAd && !skipped) {
    return (
      <ThemedView style={tailwind('flex-1 flex')}>
        <Image
          source={{ uri: adUrl }}
          style={styles.image}
        />
        {counter > 0 && (
          <View style={tailwind('absolute bottom-3 right-3')}>
            <ThemedTouchableOpacity
              onPress={() => setSkipped(true)}
              style={tailwind('p-2 rounded flex flex-row items-center')}
              dark={tailwind('bg-dfxblue-800')}
            >
              <Text style={tailwind('text-dfxblue-500 mr-1 text-xs')}>{counter} Skip</Text>
              <MaterialIcons name='skip-next' size={16} style={tailwind('text-dfxblue-500')} />
            </ThemedTouchableOpacity>
          </View>
        )}
      </ThemedView>
    )
  }

  // To prevent flicker on start of app, while API is not yet called
  if (!isLoaded) {
    return <></>
  }

  if (wallets.length === 0) {
    return <WalletNavigator />
  }

  return (
    <WalletNodeProvider data={wallets[0]}>
      <WalletContextProvider api={WalletAddressIndexPersistence}>
        <WalletDataProvider>
          <PrivacyLock />
          <BottomSheetModalProvider>
            <TransactionAuthorization />
            <AppNavigator />
          </BottomSheetModalProvider>
        </WalletDataProvider>
      </WalletContextProvider>
    </WalletNodeProvider>
  )
}

const styles = StyleSheet.create({
  image: {
    flex: 1,
    resizeMode: 'cover',
    width: '100%'
  }
})
