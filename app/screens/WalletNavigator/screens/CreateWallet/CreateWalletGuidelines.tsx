import { MaterialIcons } from '@expo/vector-icons'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useState } from 'react'
import { ScrollView, TouchableOpacity } from 'react-native'
import { Text, View, Switch } from '../../../../components'
import { Button } from '../../../../components/Button'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'
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
    <ScrollView style={tailwind('flex-1 bg-white p-4 pt-6')}>
      <Text style={tailwind('text-lg font-semibold')}>{translate('screens/Guidelines', 'Creating a wallet')}</Text>
      <Text
        style={tailwind('mt-1 text-sm font-medium text-gray-500')}
      >{translate('screens/Guidelines', 'Before you create a wallet, you will see your 24 recovery words. Keep them private and secure.')}
      </Text>
      <TouchableOpacity
        style={tailwind('mb-2')} onPress={() => navigation.navigate('GuidelinesRecoveryWords')}
        testID='recovery_words_button'
      >
        <Text
          style={tailwind('text-primary font-medium text-sm')}
        >{translate('screens/Guidelines', 'Learn more about recovery words')}
        </Text>
      </TouchableOpacity>
      {
        guidelines.map((g, i) => (
          <View key={i} style={tailwind('flex-row items-center my-3')}>
            <MaterialIcons name={g.icon} size={32} />
            <View style={tailwind('flex-col flex-auto ml-6')}>
              <Text style={tailwind('font-medium')}>{translate('screens/Guidelines', g.title)}</Text>
              <Text
                style={tailwind('text-sm text-gray-500')}
                numberOfLines={4}
              >{translate('screens/Guidelines', g.subtitle)}
              </Text>
            </View>
          </View>
        ))
      }
      <View style={tailwind('flex-row items-center my-4')}>
        <Switch
          onValueChange={toggleSwitch}
          value={isEnabled}
          testID='guidelines_switch'
        />
        <View style={tailwind('flex-auto ml-4')}>
          <Text
            style={tailwind('text-sm font-medium')}
          >{translate('screens/Guidelines', 'I understand it is my responsibility to keep my recovery words secure, and losing them will result in the irrecoverable loss of my wallet funds.')}
          </Text>
        </View>
      </View>
      <Button
        disabled={!isEnabled}
        margin='mx-0 mt-8'
        onPress={() => navigation.navigate('CreateMnemonicWallet')} title='create mnemonic words'
        testID='create_recovery_words_button'
        label={translate('screens/Guidelines', 'SHOW MY 24 RECOVERY WORDS')}
      />
    </ScrollView>
  )
}
