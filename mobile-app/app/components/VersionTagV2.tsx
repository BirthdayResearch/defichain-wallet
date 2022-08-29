import { tailwind } from '@tailwind'
import { nativeApplicationVersion } from 'expo-application'
import { ThemedTextV2, ThemedViewV2 } from '@components/themed'
import { translate } from '@translations'

export function VersionTagV2 (): JSX.Element {
  return (
    <ThemedViewV2
      light={tailwind('border-dfxblue-900')}
      dark={tailwind('bg-transparent')}
      style={tailwind('border rounded py-0.5 px-2')}
    >
      <ThemedTextV2
        dark={tailwind('text-dfxgray-400')}
        style={tailwind('text-sm font-medium')}
        testID='version_tag'
      >
        {translate('components/VersionTag', 'VERSION {{number}}', { number: nativeApplicationVersion ?? '0.0.0' })}
      </ThemedTextV2>
    </ThemedViewV2>

  )
}
