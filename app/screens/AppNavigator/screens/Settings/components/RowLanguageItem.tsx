import { LanguagePersistence } from '@api'
import { ThemedIcon, ThemedText, ThemedTouchableOpacity } from '@components/themed'
import { WalletAlert } from '@components/WalletAlert'
import { useLanguageContext } from '@contexts/LanguageProvider'
import { EnvironmentLanguage } from '@environment'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { tailwind } from '@tailwind'
import { getLocaleByLanguageName, translate } from '@translations'

import * as React from 'react'
import { useCallback } from 'react'
import { SettingsParamList } from '../SettingsNavigator'

export function RowLanguageItem (props: { language: EnvironmentLanguage }): JSX.Element {
  const navigation = useNavigation<NavigationProp<SettingsParamList>>()
  const { language, setLanguage } = useLanguageContext()
  const onPress = useCallback(async () => {
    if (getLocaleByLanguageName(props.language) === language) {
      return
    }

    WalletAlert({
      title: translate('screens/Settings', 'Language Switch'),
      message: translate(
        'screens/Settings', 'You are about to change your language to {{language}}. Do you want to proceed?', { language: props.language }),
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
  }, [language])

  const isLanguageSelected = (language: EnvironmentLanguage, languageStored: string): boolean => {
    return getLocaleByLanguageName(language) === languageStored.slice(0, 2)
  }

  return (
    <ThemedTouchableOpacity
      onPress={onPress}
      style={tailwind('flex flex-row p-4 pr-2 items-center justify-between')}
      testID={`button_language_${props.language}`}
    >
      <ThemedText style={tailwind('font-medium')}>
        {props.language}
        {/* {useTranslate('screens/LanguageSelectionScreen','Select language')}  */}
      </ThemedText>

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
