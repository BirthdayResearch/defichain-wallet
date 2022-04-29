import { tailwind } from '@tailwind'
import { nativeApplicationVersion } from 'expo-application'
import { ThemedText } from '@components/themed'

export function VersionText (): JSX.Element {
  return (
    <ThemedText
      dark={tailwind('text-gray-400 border-gray-400')}
      light={tailwind('text-gray-500 border-gray-500')}
      style={tailwind('text-sm font-medium mt-1 border rounded py-0.5 px-1.5')}
    >
      {`Version ${nativeApplicationVersion ?? '0.0.0'}`}
    </ThemedText>
  )
}
