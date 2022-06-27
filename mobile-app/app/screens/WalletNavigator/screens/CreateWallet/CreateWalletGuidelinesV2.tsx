import { Feather } from '@expo/vector-icons'
import { StackScreenProps } from '@react-navigation/stack'
import { useState } from 'react'
import * as React from 'react'
import { View, Image } from 'react-native'
import Checkbox from 'expo-checkbox'
import { ThemedIcon, ThemedScrollViewV2 as ThemedScrollView, ThemedTextV2 as ThemedText, ThemedViewV2 as ThemedView } from '@components/themed'
import { getColor, tailwind } from '@tailwind'
import { translate } from '@translations'
import { WalletParamList } from '../../WalletNavigator'
import DarkNewWallet from '@assets/images/DarkNewWallet.png'
import LightNewWallet from '@assets/images/LightNewWallet.png'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { Button } from '@components/ButtonV2'

type Props = StackScreenProps<WalletParamList, 'CreateWalletGuidelines'>

interface GuidelineItem {
  icon: React.ComponentProps<typeof Feather>['name']
  title: string
}

const guidelines: GuidelineItem[] = [
  {
    title: 'Write the words on paper. Take note of their correct spelling and order.',
    icon: 'edit-2'
  },
  {
    title: 'Secure them in a safe place. Store them offline at a place only you have access. Keep them private and do not share it with anyone.',
    icon: 'lock'
  }
]

export function CreateWalletGuidelines ({ navigation }: Props): JSX.Element {
  const [isEnabled, setIsEnabled] = useState(false)
  const toggleSwitch = (): void => setIsEnabled(previousState => !previousState)
  const { isLight } = useThemeContext()

  return (
    <ThemedScrollView
      contentContainerStyle={tailwind('pt-12 px-5 pb-16')}
      style={tailwind('flex-1')}
    >
      <View style={tailwind('flex flex-row justify-center')}>
        <Image
          style={{ width: 200, height: 136 }}
          source={isLight ? LightNewWallet : DarkNewWallet}
        />
      </View>
      <ThemedText
        style={tailwind('mt-7 px-3 text-base font-normal-v2 text-center')}
      >
        {translate('screens/Guidelines', 'You will be shown 24 recovery words on the next screen. Keep your 24-word recovery safe as it will allow you to recover access to the wallet')}
      </ThemedText>
      <ThemedText
        style={tailwind('mt-2 px-3 text-base text-center font-semibold-v2')}
      >
        {translate('screens/Guidelines', 'Learn more')}
      </ThemedText>
      <View style={tailwind('px-3 mt-12')}>
        {guidelines.map((g, i) => (
          <View
            key={i}
            style={tailwind('flex-row items-start my-3')}
          >
            <ThemedView
              light={tailwind('bg-mono-light-v2-700')}
              dark={tailwind('bg-mono-dark-v2-700')}
              style={tailwind('h-6 w-6 flex-row items-center justify-center rounded-full mt-1')}
            >
              <ThemedIcon
                light={tailwind('text-mono-light-v2-100')}
                dark={tailwind('text-mono-dark-v2-100')}
                iconType='Feather'
                name={g.icon}
                size={14}
              />
            </ThemedView>
            <ThemedText
              light={tailwind('text-mono-light-v2-700')}
              dark={tailwind('text-mono-dark-v2-700')}
              style={tailwind('text-xs ml-4 font-normal-v2')}
            >
              {translate('screens/Guidelines', g.title)}
            </ThemedText>
          </View>
       ))}
        <View style={tailwind('flex-row items-start mt-3')}>
          <Checkbox
            value={isEnabled}
            onValueChange={toggleSwitch}
            style={tailwind('h-6 w-6 mt-1 rounded')}
            color={isEnabled ? getColor('brand-v2-500') : undefined}
          />
          <ThemedText
            light={tailwind('text-mono-light-v2-700')}
            dark={tailwind('text-mono-dark-v2-700')}
            style={tailwind('text-xs ml-4 font-normal-v2')}
          >
            {translate('screens/Guidelines', 'I understand it is my responsibility to keep my recovery words secure. Losing them will result in the irrecoverable loss of access to my wallet funds.')}
          </ThemedText>
        </View>
      </View>
      <Button
        disabled={!isEnabled}
        style={tailwind('rounded')}
        label={translate('screens/Guidelines', 'Create wallet')}
        styleProps='mt-12 mx-7'
        onPress={() => navigation.navigate('CreateMnemonicWallet')}
        testID='create_recovery_words_button'
      />
    </ThemedScrollView>
  )
}
