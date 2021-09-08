import { SectionTitle } from '@components/SectionTitle'
import { getAppLanguages, translate } from '@translations'
import * as React from 'react'
import { View } from 'react-native'
import { RowLanguageItem } from '../components/RowLanguageItem'

export function LanguageSelectionScreen (): JSX.Element {
  const languages = getAppLanguages()

  return (
    <View testID='language_selection_screen'>
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
    </View>
  )
}
