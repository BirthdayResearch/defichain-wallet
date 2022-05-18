import { tailwind } from '@tailwind'
import { nativeApplicationVersion } from 'expo-application'
import { ThemedText } from '@components/themed'
import { translate } from '@translations'

export function VersionTag (): JSX.Element {
  return (
    <ThemedText
      dark={tailwind('text-gray-400 border-gray-700')}
      light={tailwind('text-gray-500 border-gray-200')}
      style={tailwind('text-sm font-medium border rounded py-0.5 px-2')}
      testID='version_tag'
    >
      {translate('components/VersionTag', 'Version {{number}}', { number: nativeApplicationVersion ?? '0.0.0' })}
    </ThemedText>
  )
}
