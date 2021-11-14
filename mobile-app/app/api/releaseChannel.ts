import * as Updates from 'expo-updates'
import { Platform } from 'react-native'

export function getReleaseChannel (): string {
  if (__DEV__) {
    return 'development'
  }

  if (Platform.OS === 'web') {
    return 'production'
  }

  return Updates.releaseChannel
}
