import { ThemedScrollView } from '@components/themed'
import { ThemedSectionTitle } from '@components/themed/ThemedSectionTitle'
import { getAppLanguages, translate } from '@translations'
import { RowLanguageItem } from '../components/RowLanguageItem'
import { tailwind } from '@tailwind'

export function LanguageSelectionScreen (): JSX.Element {
  const languages = getAppLanguages()

  return (
    <ThemedScrollView testID='language_selection_screen'>
      <ThemedSectionTitle
        style={tailwind('px-8 pt-6 pb-2 text-xs text-gray-500 font-medium')}
        testID='language_selection_screen_title'
        text={translate('screens/LanguageSelectionScreen', 'LANGUAGE')}
      />
      {
        languages.map((language, index) => (
          <RowLanguageItem
            key={index}
            languageItem={language}
            firstItem={index === 0}
            lastItem={index === languages.length - 1}
          />
        ))
      }
    </ThemedScrollView>
  )
}
