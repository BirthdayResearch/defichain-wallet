import { useWalletContext } from '@shared-contexts/WalletContext'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { ThemedView, ThemedText } from './themed'
import { View } from '@components'
import { AddressSelectionButton } from '@screens/AppNavigator/screens/Portfolio/components/AddressSelectionButton'

export function WalletAddressRow (): JSX.Element {
  const { address, addressLength } = useWalletContext()

  return (
    <ThemedView
      dark={tailwind('bg-dfxblue-800 border-b border-dfxblue-900')}
      light={tailwind('bg-white border-b border-gray-300')}
      style={tailwind('p-4 flex-row w-full items-center justify-between')}
    >
      <ThemedText
        style={tailwind('text-sm')}
        testID='wallet_address_text'
      >
        {translate('components/WalletAddressRow', 'Wallet address')}
      </ThemedText>
      <View>
        <AddressSelectionButton address={address} addressLength={addressLength} disabled />
      </View>
    </ThemedView>
  )
}
