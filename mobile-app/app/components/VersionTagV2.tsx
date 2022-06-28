import { tailwind } from '@tailwind'
import { nativeApplicationVersion } from 'expo-application'
import { ThemedTextV2, ThemedViewV2 } from '@components/themed'
import { translate } from '@translations'

export function VersionTagV2 (): JSX.Element {
  return (
    <ThemedViewV2>
      <ThemedTextV2
        dark={tailwind('text-mono-dark-v2-900')}
        light={tailwind('text-mono-light-v2-900')}
        style={tailwind('text-sm font-normal-v2 text-center')}
        testID='version_tag'
      >
        {translate('components/VersionTag', 'Version {{number}}', { number: nativeApplicationVersion ?? '0.0.0' })}
      </ThemedTextV2>
    </ThemedViewV2>

  )
}
