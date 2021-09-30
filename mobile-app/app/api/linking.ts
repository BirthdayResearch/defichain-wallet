import { Platform } from 'react-native'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'

export async function openURL (url: string): Promise<void> {
  if (Platform.OS === 'android') {
    await WebBrowser.openBrowserAsync(url)
  } else {
    const supported = await Linking.canOpenURL(url)
    if (supported) {
      await Linking.openURL(url)
    } else {
      await WebBrowser.openBrowserAsync(url)
    }
  }
}
