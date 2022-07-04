import { tailwind } from '@tailwind'
import { Platform } from 'react-native'
import { ThemedIcon } from './themed'

export function HeaderBackButton (): JSX.Element {
  return (
    <ThemedIcon
      size={28}
      name='chevron-left'
      iconType='Feather'
      light={tailwind('text-mono-light-v2-900')}
      dark={tailwind('text-mono-dark-v2-900')}
      style={tailwind('relative', { 'right-2': Platform.OS === 'ios', 'right-5': Platform.OS === 'android' })}
    />
  )
}
