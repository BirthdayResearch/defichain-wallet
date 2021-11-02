import { Platform } from 'react-native'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'

export async function openURL (url: string): Promise<void> {
  if (Platform.OS === 'web') {
    window.open(url, '_target')
  } else {
    if (Platform.OS !== 'android') {
      const supported = await Linking.canOpenURL(url)
      if (supported) {
        await Linking.openURL(url)
        return
      }
    }
    await WebBrowser.openBrowserAsync(url)
  }
}
