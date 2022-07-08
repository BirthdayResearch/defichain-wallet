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
        style={tailwind('px-10 pt-6 pb-2 text-xs font-normal-v2')}
        light={tailwind('text-mono-light-v2-500')}
        dark={tailwind('text-mono-dark-v2-500')}
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
