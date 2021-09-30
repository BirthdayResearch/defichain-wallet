import * as WebBrowser from 'expo-web-browser'

export async function openURL (url: string): Promise<void> {
  await WebBrowser.openBrowserAsync(url)
  /* if (Platform.OS === 'android') {

  } else {
    const supported = await Linking.canOpenURL(url)
    if (supported) {
      await Linking.openURL(url)
    } else {
      await WebBrowser.openBrowserAsync(url)
    }
  } */
}
