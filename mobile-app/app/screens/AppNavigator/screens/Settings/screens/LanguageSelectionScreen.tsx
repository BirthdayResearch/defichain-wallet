import { ThemedScrollViewV2, ThemedSectionTitleV2, ThemedViewV2 } from '@components/themed'
import { getAppLanguages, translate } from '@translations'
import { RowLanguageItem } from '../components/RowLanguageItem'
import { tailwind } from '@tailwind'

export function LanguageSelectionScreen (): JSX.Element {
  const languages = getAppLanguages()

  return (
    <ThemedScrollViewV2
      style={tailwind('flex-1')}
      contentContainerStyle={tailwind('px-5')}
      testID='language_selection_screen'
    >
      <ThemedSectionTitleV2
        testID='language_selection_screen_title'
        text={translate('screens/LanguageSelectionScreen', 'LANGUAGE')}
      />
      <ThemedViewV2
        dark={tailwind('bg-mono-dark-v2-00')}
        light={tailwind('bg-mono-light-v2-00')}
        style={tailwind('rounded-2lg')}
      >
        {
        languages.map((language, index) => (
          <RowLanguageItem
            key={index}
            languageItem={language}
            border={index < languages.length - 1}
          />
        ))
        }
      </ThemedViewV2>
    </ThemedScrollViewV2>
  )
}
