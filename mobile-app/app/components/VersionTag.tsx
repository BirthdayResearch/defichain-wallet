import { tailwind } from '@tailwind'
import { nativeApplicationVersion } from 'expo-application'
import { ThemedText, ThemedView } from '@components/themed'
import { translate } from '@translations'

export function VersionTag (): JSX.Element {
  return (
    <ThemedView
      dark={tailwind('border-dfxblue-900')}
      light={tailwind('border-gray-200')}
      style={tailwind('border rounded py-0.5 px-2')}
    >
      <ThemedText
        dark={tailwind('text-dfxgray-400')}
        light={tailwind('text-gray-500')}
        style={tailwind('text-sm font-medium')}
        testID='version_tag'
      >
        {translate('components/VersionTag', 'Version {{number}}', { number: nativeApplicationVersion ?? '0.0.0' })}
      </ThemedText>
    </ThemedView>

  )
}
