import { NavigationProp, useNavigation } from '@react-navigation/native'
import * as React from 'react'
import { View } from '../../../components'
import { Button } from '../../../components/Button'
import { ThemedScrollView } from '../../../components/themed'
import { tailwind } from '../../../tailwind'
import { translate } from '../../../translations'
import { WalletParamList } from '../WalletNavigator'
import { OnboardingCarousel } from './components/OnboardingCarousel'

export function Onboarding (): JSX.Element {
  const navigator = useNavigation<NavigationProp<WalletParamList>>()

  return (
    <ThemedScrollView
      testID='onboarding_carousel'
      contentContainerStyle={tailwind('h-full')}
      style={tailwind('flex-1')}
    >
      <View style={tailwind('h-4/6')}>
        <OnboardingCarousel />
      </View>
      <View style={tailwind('mt-8 px-4')}>
        <Button
          onPress={() => navigator.navigate('CreateWalletGuidelines')}
          label={translate('screens/Onboarding', 'CREATE A WALLET')}
          testID='create_wallet_button'
          title='create_wallet'
          margin='m-2'
        />
        <Button
          onPress={() => navigator.navigate('RestoreMnemonicWallet')}
          label={translate('screens/Onboarding', 'RESTORE WALLET')}
          testID='restore_wallet_button'
          title='restore_wallet'
          fill='flat'
          margin='m-2'
        />
      </View>
    </ThemedScrollView>
  )
}
