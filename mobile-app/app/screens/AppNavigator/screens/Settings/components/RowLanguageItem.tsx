import { ThemedIcon, ThemedTextV2, ThemedTouchableOpacityV2 } from '@components/themed'
import { WalletAlert } from '@components/WalletAlert'
import { useLanguageContext } from '@shared-contexts/LanguageProvider'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { tailwind } from '@tailwind'
import { AppLanguageItem, translate } from '@translations'
import { View, Text } from 'react-native'
import { SettingsParamList } from '../SettingsNavigator'

export function RowLanguageItem ({ languageItem, border }: { languageItem: AppLanguageItem, border: boolean}): JSX.Element {
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
    <ThemedTouchableOpacityV2
      onPress={onPress}
      style={tailwind('flex flex-row items-center justify-between py-4.5 mx-5', { 'border-b-0.5': border })}
      testID={`button_language_${languageItem.language}`}
    >
      <View style={tailwind('flex flex-row items-center')}>
        <ThemedTextV2 testID='language_option' style={tailwind('font-normal-v2 text-sm pr-1')}>
          {languageItem.displayName}
        </ThemedTextV2>
        {!language.startsWith(languageItem.locale) &&
          <ThemedTextV2
            testID='language_option_description'
            dark={tailwind('text-mono-dark-v2-900')}
            light={tailwind('text-mono-light-v2-900')}
            style={tailwind('font-normal-v2 text-sm')}
          >
            <Text>
              ({translate('screens/Settings', languageItem.language)})
            </Text>
          </ThemedTextV2>}
      </View>
      <View
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
    </ThemedTouchableOpacityV2>
  )
}
