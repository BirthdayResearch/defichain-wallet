import { Ionicons } from '@expo/vector-icons'
import * as Font from 'expo-font'
import * as React from 'react'

async function loadResourcesAndDataAsync (): Promise<void> {
  try {
    await Font.loadAsync({
      ...Ionicons.font,
      'space-mono': require('../assets/fonts/SpaceMono-Regular.ttf')
    })
  } catch (e) {
    // TODO(@defich/wallet): We might want to provide this error information to an error reporting service
    console.warn(e)
  }
}

/**
 * Delaying splash screen to load additional resources prior to rendering the app
 */
export default function useCachedResources (): boolean {
  const [isLoadingComplete, setLoadingComplete] = React.useState(false)

  React.useEffect(() => {
    loadResourcesAndDataAsync().finally(() => {
      setLoadingComplete(true)
    })
  }, [])

  return isLoadingComplete
}
