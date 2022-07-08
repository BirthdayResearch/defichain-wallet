import { ThemedIcon, ThemedText, ThemedTouchableOpacity } from '@components/themed'
import { WalletAlert } from '@components/WalletAlert'
import { useLanguageContext } from '@shared-contexts/LanguageProvider'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { tailwind } from '@tailwind'
import { AppLanguageItem, translate } from '@translations'
import { View } from 'react-native'
import { SettingsParamList } from '../SettingsNavigator'

export function RowLanguageItem ({ languageItem, firstItem, lastItem }: { languageItem: AppLanguageItem, firstItem: boolean, lastItem: boolean}): JSX.Element {
  const navigation = useNavigation<NavigationProp<SettingsParamList>>()
  const { isLight } = useThemeContext()
  const {
    language,
    setLanguage
  } = useLanguageContext()

  const onPress = async (): Promise<void> => {
    if (languageItem.locale === language) {
      return
    }

    WalletAlert({
      title: translate('screens/Settings', 'Switch Language'),
      message: translate(
        'screens/Settings', 'You are about to change your language to {{language}}. Do you want to proceed?', { language: translate('screens/Settings', languageItem.language) }),
      buttons: [
        {
          text: translate('screens/Settings', 'No'),
          style: 'cancel'
        },
        {
          text: translate('screens/Settings', 'Yes'),
          style: 'destructive',
          onPress: async () => {
            await setLanguage(languageItem.locale)
            navigation.goBack()
          }
        }
      ]
    })
  }

  const checkActive = 'bg-success-600'
  const checkInactive = `${isLight ? 'bg-mono-light-v2-700 bg-opacity-30' : 'bg-mono-dark-v2-700 bg-opacity-30'}`

  return (
    <ThemedTouchableOpacity
      onPress={onPress}
      style={tailwind('mx-5', { 'rounded-t-lg': firstItem }, { 'rounded-b-lg': lastItem })}
      testID={`button_language_${languageItem.language}`}
      dark={tailwind('bg-mono-dark-v2-00')}
      light={tailwind('bg-mono-light-v2-00')}
    >
      <View style={tailwind(`flex flex-row mx-5 py-4 items-center justify-between border-b-0.5 ${isLight ? 'border-mono-light-v2-300' : 'border-mono-dark-v2-300'}`, { 'border-b-0': lastItem })}>
        <View style={tailwind('flex flex-row items-center')}>
          <ThemedText testID='language_option' style={tailwind('font-normal-v2')}>
            {languageItem.displayName}
          </ThemedText>
          {languageItem.displayName !== 'English' &&
            <ThemedText
              testID='language_option_description'
              dark={tailwind('text-mono-dark-v2-900')}
              light={tailwind('text-mono-light-v2-900')}
              style={tailwind('font-normal-v2')}
            >
              {translate('screens/Settings', ` (${languageItem.language})`)}
            </ThemedText>}
        </View>
        <View
          // style={tailwind(`p-px rounded-full ${language.startsWith(languageItem.locale) ? 'bg-success-600' : isLight ? 'bg-mono-light-v2-700 bg-opacity-30' : 'bg-mono-dark-v2-700 bg-opacity-30'}`)}
          style={tailwind(`p-px rounded-full ${language.startsWith(languageItem.locale) ? checkActive : checkInactive}`)}
        >
          <ThemedIcon
            iconType='MaterialIcons'
            dark={tailwind('text-mono-dark-v2-00')}
            light={tailwind('text-mono-light-v2-00')}
            name='check'
            size={18}
            testID={`button_network_${languageItem.language}_check`}
          />
        </View>
      </View>
    </ThemedTouchableOpacity>
  )
}
