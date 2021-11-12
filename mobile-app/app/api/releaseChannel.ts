import * as Updates from 'expo-updates'
import { Platform } from 'react-native'
import Constants from 'expo-constants'

export function getReleaseChannel (): string {
  if (Platform.OS === 'web') {
    return Constants?.manifest?.extra?.mode ?? Updates.releaseChannel
  } else {
    return Updates.releaseChannel
  }
}
