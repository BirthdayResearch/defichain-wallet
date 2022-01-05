import { MaterialIcons } from '@expo/vector-icons'
import { StackScreenProps } from '@react-navigation/stack'
import { useState } from 'react'
import * as React from 'react'
import { TouchableOpacity } from 'react-native'
import { Switch, View } from '@components/index'
import { Button } from '@components/Button'
import { ThemedIcon, ThemedScrollView, ThemedText } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { WalletParamList } from '../../WalletNavigator'

type Props = StackScreenProps<WalletParamList, 'CreateWalletGuidelines'>

interface GuidelineItem {
  icon: React.ComponentProps<typeof MaterialIcons>['name']
  title: string
  subtitle: string
}

const guidelines: GuidelineItem[] = [
  {
    title: 'Write the words on paper',
    subtitle: 'Take note of their correct spelling and correct order.',
    icon: 'create'
  },
  {
    title: 'Secure them in a safe space',
    subtitle: 'Store them offline and in a safe place.',
    icon: 'lock'
  },
  {
    title: 'Keep them private',
    subtitle: 'Don’t share to anyone. Keep the recovery words only to yourself.',
    icon: 'visibility-off'
  }
]

export function CreateWalletGuidelines ({ navigation }: Props): JSX.Element {
  const [isEnabled, setIsEnabled] = useState(false)
  const toggleSwitch = (): void => setIsEnabled(previousState => !previousState)
  return (
    <ThemedScrollView
      dark={tailwind('bg-gray-900')}
      light={tailwind('bg-white')}
      style={tailwind('flex-1 p-4 pt-6')}
    >
      <ThemedText
        style={tailwind('text-lg font-semibold')}
      >
        {translate('screens/Guidelines', 'Creating a wallet')}
      </ThemedText>

      <ThemedText
        dark={tailwind('text-gray-400')}
        light={tailwind('text-gray-500')}
        style={tailwind('mt-1 text-sm font-medium')}
      >
        {translate('screens/Guidelines', 'Before you create a wallet, you will see your 24 recovery words. Keep them private and secure.')}
      </ThemedText>

      <TouchableOpacity
        onPress={() => navigation.navigate('RecoveryWordsFaq')}
        style={tailwind('mb-2')}
        testID='recovery_words_button'
      >
        <ThemedText
          dark={tailwind('text-darkprimary-500')}
          light={tailwind('text-primary-500')}
          style={tailwind('font-medium text-sm')}
        >
          {translate('screens/Guidelines', 'Learn more about recovery words')}
        </ThemedText>
      </TouchableOpacity>

      {
        guidelines.map((g, i) => (
          <View
            key={i}
            style={tailwind('flex-row items-center my-3')}
          >
            <ThemedIcon
              iconType='MaterialIcons'
              name={g.icon}
              size={32}
            />

            <View style={tailwind('flex-col flex-auto ml-6')}>
              <ThemedText style={tailwind('font-medium')}>
                {translate('screens/Guidelines', g.title)}
              </ThemedText>

              <ThemedText
                dark={tailwind('text-gray-400')}
                light={tailwind('text-gray-500')}
                numberOfLines={4}
                style={tailwind('text-sm')}
              >
                {translate('screens/Guidelines', g.subtitle)}
              </ThemedText>
            </View>
          </View>
        ))
      }

      <View style={tailwind('flex-row items-center my-4')}>
        <Switch
          onValueChange={toggleSwitch}
          testID='guidelines_switch'
          value={isEnabled}
        />

        <View style={tailwind('flex-auto ml-4')}>
          <ThemedText
            style={tailwind('text-sm font-medium')}
          >
            {translate('screens/Guidelines', 'I understand it is my responsibility to keep my recovery words secure, and losing them will result in the irrecoverable loss of my wallet funds.')}
          </ThemedText>
        </View>
      </View>

      <Button
        disabled={!isEnabled}
        label={translate('screens/Guidelines', 'SHOW MY 24 RECOVERY WORDS')}
        margin='mx-0 mt-8 mb-8'
        onPress={() => navigation.navigate('CreateMnemonicWallet')}
        testID='create_recovery_words_button'
        title='create mnemonic words'
      />
    </ThemedScrollView>
  )
}
