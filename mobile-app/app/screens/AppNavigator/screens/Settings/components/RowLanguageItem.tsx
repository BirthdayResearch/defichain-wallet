import { ThemedIcon, ThemedText, ThemedTouchableOpacity } from '@components/themed'
import { WalletAlert } from '@components/WalletAlert'
import { useLanguageContext } from '@shared-contexts/LanguageProvider'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { tailwind } from '@tailwind'
import { AppLanguageItem, translate } from '@translations'
import { View } from 'react-native'
import { SettingsParamList } from '../SettingsNavigator'

export function RowLanguageItem ({ languageItem, firstItem, lastItem }: { languageItem: AppLanguageItem, firstItem: boolean, lastItem: boolean}): JSX.Element {
  const navigation = useNavigation<NavigationProp<SettingsParamList>>()
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

  return (
    <ThemedTouchableOpacity
      onPress={onPress}
      style={tailwind('flex flex-row p-4 pr-2 mx-5 items-center justify-between')}
      testID={`button_language_${languageItem.language}`}
      light={tailwind('bg-mono-light-v2-00 border-b border-gray-200', { 'rounded-t-lg': firstItem }, { 'border-b-0 rounded-b-lg': lastItem })}
      dark={tailwind('bg-mono-dark-v2-00 border-b border-gray-700', { 'rounded-t-lg': firstItem }, { 'border-b-0 rounded-b-lg': lastItem })}
    >
      <View style={tailwind('flex flex-row items-center')}>
        <ThemedText testID='language_option' style={tailwind('font-medium')}>
          {languageItem.displayName}
        </ThemedText>
        {languageItem.displayName !== 'English' &&
          <ThemedText
            testID='language_option_description'
            dark={tailwind('text-white')}
            light={tailwind('text-black')}
            style={tailwind('font-medium')}
          >
            {translate('screens/Settings', ` (${languageItem.language})`)}
          </ThemedText>}
      </View>
      <ThemedIcon
        iconType='MaterialIcons'
        dark={tailwind('bg-success-600 p-px rounded-full text-mono-dark-v2-00', { 'bg-mono-dark-v2-700 bg-opacity-30': !language.startsWith(languageItem.locale) })}
        light={tailwind('bg-success-600 p-px rounded-full text-mono-light-v2-00', { 'bg-mono-dark-v2-700 bg-opacity-30': !language.startsWith(languageItem.locale) })}
        name='check'
        size={18}
        testID={`button_network_${languageItem.language}_check`}
      />
    </ThemedTouchableOpacity>
  )
}
