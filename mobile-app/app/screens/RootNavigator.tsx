
import { WalletContextProvider } from '@shared-contexts/WalletContext'
import { WalletNodeProvider } from '@shared-contexts/WalletNodeProvider'
import { useWalletPersistenceContext } from '@shared-contexts/WalletPersistenceContext'
import { AppNavigator } from './AppNavigator/AppNavigator'
import { PrivacyLock } from './PrivacyLock'
import { TransactionAuthorization } from './TransactionAuthorization/TransactionAuthorization'
import { WalletNavigator } from './WalletNavigator/WalletNavigator'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { WalletAddressIndexPersistence } from '@api/wallet/address_index'

/**
 * Top Root Level Wallet State to control what screen to show
 */
export function RootNavigator (): JSX.Element {
  const {
    wallets,
    isLoaded
  } = useWalletPersistenceContext()

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
        <PrivacyLock />
        <BottomSheetModalProvider>
          <TransactionAuthorization />
          <AppNavigator />
        </BottomSheetModalProvider>
      </WalletContextProvider>
    </WalletNodeProvider>
  )
}
