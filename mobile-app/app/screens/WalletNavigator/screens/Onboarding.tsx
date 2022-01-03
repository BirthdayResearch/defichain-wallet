import { NavigationProp, useNavigation } from '@react-navigation/native'
import { View } from '@components/index'
import { Button } from '@components/Button'
import { ThemedScrollView } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { WalletParamList } from '../WalletNavigator'
import { OnboardingCarousel } from './components/OnboardingCarousel'

export function Onboarding (): JSX.Element {
  const navigator = useNavigation<NavigationProp<WalletParamList>>()

  return (
    <ThemedScrollView
      contentContainerStyle={tailwind('h-full')}
      style={tailwind('flex-1')}
      testID='onboarding_carousel'
    >
      <View style={tailwind('h-4/6')}>
        <OnboardingCarousel />
      </View>

      <View style={tailwind('mt-8 px-4')}>
        <Button
          label={translate('screens/Onboarding', 'CREATE A WALLET')}
          margin='m-2'
          onPress={() => navigator.navigate('CreateWalletGuidelines')}
          testID='create_wallet_button'
          title='create_wallet'
        />

        <Button
          fill='flat'
          label={translate('screens/Onboarding', 'RESTORE WALLET')}
          margin='m-2'
          onPress={() => navigator.navigate('RestoreMnemonicWallet')}
          testID='restore_wallet_button'
          title='restore_wallet'
        />
      </View>
    </ThemedScrollView>
  )
}
