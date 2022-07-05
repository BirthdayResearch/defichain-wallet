import { ThemedScrollViewV2, ThemedTextV2 } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { ImageBackground, Image, Dimensions, Platform, View } from 'react-native'
import GridBackgroundDark from '@assets/images/onboarding/grid-background-dark.png'
import GridBackgroundLight from '@assets/images/onboarding/grid-background-light.png'
import { WalletParamListV2 } from '@screens/WalletNavigator/WalletNavigator'
import { StackScreenProps } from '@react-navigation/stack'
import CoinImageCreate from '@assets/images/create-success-coin.png'
import CoinImageRestore from '@assets/images/restore-success-coin.png'
import { ButtonV2 } from '@components/ButtonV2'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { initJellyfishWallet, MnemonicEncrypted } from '@api/wallet'
import { useWalletPersistenceContext, WalletPersistenceDataI } from '@shared-contexts/WalletPersistenceContext'
import { EncryptedProviderData } from '@defichain/jellyfish-wallet-encrypted'
import { MAX_ALLOWED_ADDRESSES } from '@shared-contexts/WalletContext'
import { WalletAddressIndexPersistence } from '@api/wallet/address_index'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { useNetworkContext } from '@shared-contexts/NetworkContext'

type Props = StackScreenProps<WalletParamListV2, 'WalletCreateRestoreSuccess'>

export function WalletCreateRestoreSuccess ({ route }: Props): JSX.Element {
  const { isWalletRestored, data } = route.params
  const { network } = useNetworkContext()
  const { isLight } = useThemeContext()
  const { setWallet } = useWalletPersistenceContext()
  const client = useWhaleApiClient()
  const safeAreaInsets = useSafeAreaInsets()
  // Needs for it to work on web. Otherwise, it takes full window size
  const { width, height } = Platform.OS === 'web' ? { width: '375px', height: '100%' } : Dimensions.get('window')
  // show all content for small screen and web to adjust margins and paddings
  const isSmallScreen = height <= 667 || Platform.OS === 'web'

  async function handleOnPress (): Promise<void> {
    if (isWalletRestored) {
      await discoverWalletAddresses(data)
    }
    await setWallet(data)
  }

  async function discoverWalletAddresses (data: WalletPersistenceDataI<EncryptedProviderData>): Promise<void> {
    const provider = await MnemonicEncrypted.initProvider(data, network, {
      /**
       * wallet context only use for READ purpose (non signing)
       * see {@link TransactionAuthorization} for signing implementation
       */
      async prompt () {
        throw new Error('No UI attached for passphrase prompting')
      }
    })
    const wallet = await initJellyfishWallet(provider, network, client)

    // get discovered address
    const activeAddress = await wallet.discover(MAX_ALLOWED_ADDRESSES)

    // sub 1 from total discovered address to get address index of last active address
    const lastDiscoveredAddressIndex = Math.max(0, activeAddress.length - 1)
    await WalletAddressIndexPersistence.setLength(lastDiscoveredAddressIndex)
  }

  return (
    <ThemedScrollViewV2
      style={[
        tailwind('flex-1'), {
          paddingTop: safeAreaInsets.top,
          paddingBottom: safeAreaInsets.bottom
        }
      ]}
      light={tailwind('bg-mono-light-v2-00')}
      dark={tailwind('bg-mono-dark-v2-00')}
      contentContainerStyle={tailwind('pb-16', { 'pt-12': !isSmallScreen })}
      testID='wallet_create-restore_success'
    >
      <View style={tailwind('pt-10 px-10')}>
        <ThemedTextV2
          style={tailwind('text-xl text-center font-semibold-v2')}
        >
          {translate('screens/WalletCreateRestoreSuccess', isWalletRestored ? 'Wallet restored!' : 'Wallet created!')}
        </ThemedTextV2>
        <ThemedTextV2
          style={tailwind('text-center mt-2 font-normal-v2')}
        >
          {translate('screens/WalletCreateRestoreSuccess', 'Access decentralized finance with Bitcoin-grade security, strength and immutability.')}
        </ThemedTextV2>
      </View>
      <View style={tailwind(isSmallScreen ? 'mt-14' : 'mt-28')}>
        <ImageBackground
          imageStyle={tailwind('top-36 mt-3')}
          style={tailwind('relative')}
          source={isLight ? GridBackgroundLight : GridBackgroundDark}
          resizeMode='cover'
        >
          <Image
            source={isWalletRestored ? CoinImageRestore : CoinImageCreate}
            style={{ width: width, height: 332 }}
          />
          <View style={tailwind('px-12')}>
            <ButtonV2
              onPress={handleOnPress}
              styleProps='mt-9'
              testID='continue_button'
              label={translate('screens/WalletCreateRestoreSuccess', 'Continue')}
            />
          </View>
        </ImageBackground>
      </View>
    </ThemedScrollViewV2>
  )
}
