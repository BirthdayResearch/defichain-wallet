import { ThemedScrollView } from '@components/themed'
import { ThemedSectionTitle } from '@components/themed/ThemedSectionTitle'
import { getAppLanguages, translate } from '@translations'
import { RowLanguageItem } from '../components/RowLanguageItem'

export function LanguageSelectionScreen (): JSX.Element {
  const languages = getAppLanguages()

  return (
    <ThemedScrollView testID='language_selection_screen'>
      <ThemedSectionTitle
        testID='language_selection_screen_title'
        text={translate('screens/LanguageSelectionScreen', 'LANGUAGE')}
      />

      {
        languages.map((language, index) => (
          <RowLanguageItem
            key={index}
            languageItem={language}
          />
        ))
      }
    </ThemedScrollView>
  )
}
