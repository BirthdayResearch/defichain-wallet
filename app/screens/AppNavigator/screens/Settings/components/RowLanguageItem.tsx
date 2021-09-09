import { LanguagePersistence } from '@api'
import { ThemedIcon, ThemedText, ThemedTouchableOpacity } from '@components/themed'
import { WalletAlert } from '@components/WalletAlert'
import { useLanguageContext } from '@contexts/LanguageProvider'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { tailwind } from '@tailwind'
import { AppLanguage, getLanguageName, getLocaleByLanguageName, translate } from '@translations'
import * as React from 'react'
import { View } from 'react-native'
import { SettingsParamList } from '../SettingsNavigator'

export function RowLanguageItem (props: { language: AppLanguage }): JSX.Element {
  const navigation = useNavigation<NavigationProp<SettingsParamList>>()
  const { language, setLanguage } = useLanguageContext()
  const onPress = async (): Promise<void> => {
    if (getLocaleByLanguageName(props.language) === language) {
      return
    }

    WalletAlert({
      title: translate('screens/Settings', 'Switch Language'),
      message: translate(
        'screens/Settings', 'You are about to change your language to {{language}}. Do you want to proceed?', { language: getLanguageName(props.language) }),
      buttons: [
        {
          text: translate('screens/Settings', 'No'),
          style: 'cancel'
        },
        {
          text: translate('screens/Settings', 'Yes'),
          style: 'destructive',
          onPress: async () => {
            setLanguage(getLocaleByLanguageName(props.language))
            await LanguagePersistence.set(getLocaleByLanguageName(props.language))
            navigation.goBack()
          }
        }
      ]
    })
  }

  const isLanguageSelected = (language: AppLanguage, languageStored: string): boolean => {
    return getLocaleByLanguageName(language) === languageStored.slice(0, 2)
  }

  return (
    <ThemedTouchableOpacity
      onPress={onPress}
      style={tailwind('flex flex-row p-4 pr-2 items-center justify-between')}
      testID={`button_language_${props.language}`}
    >
      <View>
        <ThemedText testID='language_option' style={tailwind('font-medium')}>
          {getLanguageName(props.language)}
        </ThemedText>
        <ThemedText
          testID='language_option_description'
          dark={tailwind('text-gray-400')}
          light={tailwind('text-gray-500')}
          style={tailwind('text-sm')}
        >
          {translate('screens/Settings', props.language)}
        </ThemedText>
      </View>
      {
        isLanguageSelected(props.language, language) &&
        (
          <ThemedIcon
            dark={tailwind('text-darkprimary-500')}
            iconType='MaterialIcons'
            light={tailwind('text-primary-500')}
            name='check'
            size={24}
            testID={`button_network_${props.language}_check`}
          />
        )
      }
    </ThemedTouchableOpacity>
  )
}
