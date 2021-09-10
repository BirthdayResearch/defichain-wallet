import { SectionTitle } from '@components/SectionTitle'
import { ThemedScrollView } from '@components/themed'
import { getAppLanguages, translate } from '@translations'
import * as React from 'react'
import { RowLanguageItem } from '../components/RowLanguageItem'

export function LanguageSelectionScreen (): JSX.Element {
  const languages = getAppLanguages()

  return (
    <ThemedScrollView>
      <SectionTitle
        testID='language_selection_screen_title'
        text={translate('screens/LanguageSelectionScreen', 'LANGUAGE')}
      />

      {
        languages.map((language, index) => (
          <RowLanguageItem
            key={index}
            language={language}
          />
        ))
      }
    </ThemedScrollView>
  )
}
