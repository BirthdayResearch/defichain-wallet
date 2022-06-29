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
import { SafeAreaView } from 'react-native-safe-area-context'

type Props = StackScreenProps<WalletParamListV2, 'WalletCreateRestoreSuccess'>

export function WalletCreateRestoreSuccess ({ route }: Props): JSX.Element {
  const isWalletRestored = route.params?.isWalletRestored
  const { isLight } = useThemeContext()

  // Needs for it to work on web. Otherwise, it takes full window size
  const { width } = Platform.OS === 'web' ? { width: '375px' } : Dimensions.get('window')

  return (
    <SafeAreaView style={tailwind('w-full h-full')}>
      <ThemedScrollViewV2
        style={tailwind('flex-1')}
        contentContainerStyle={tailwind('pt-12 pb-16')}
        testID='wallet_create-restore_success'
      >
        <View style={tailwind('pt-10 px-10')}>
          <ThemedTextV2
            style={tailwind('text-xl text-center font-semibold-v2')}
          >
            {translate('screens/VerifyMnemonicWallet', isWalletRestored ? 'Wallet restored!' : 'Wallet created!')}
          </ThemedTextV2>
          <ThemedTextV2
            style={tailwind('text-center mt-2 font-normal-v2')}
          >
            {translate('screens/VerifyMnemonicWallet', 'Access decentralized finance with Bitcoin-grade security, strength and immutability.')}
          </ThemedTextV2>
        </View>
        <View style={tailwind('mt-28')}>
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
                styleProps='mt-9'
                testID='continue_button'
                label={translate('screens/Onboarding', 'Continue')}
              />
            </View>
          </ImageBackground>
        </View>
      </ThemedScrollViewV2>
    </SafeAreaView>
  )
}
