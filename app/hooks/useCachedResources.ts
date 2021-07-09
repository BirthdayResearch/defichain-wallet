import { MaterialIcons } from '@expo/vector-icons'
import * as Font from 'expo-font'
import { useEffect, useState } from 'react'

/**
 * Delaying splash screen to load additional resources prior to rendering the app
 * @return boolean when loading complete
 */
export function useCachedResources (): boolean {
  const [isLoaded, setLoaded] = useState(false)

  useEffect(() => {
    loadResourcesAndDataAsync().finally(() => {
      setLoaded(true)
    })
  }, [])

  return isLoaded
}

async function loadResourcesAndDataAsync (): Promise<void> {
  try {
    await Font.loadAsync({
      ...MaterialIcons.font,
      'space-mono': require('../assets/fonts/SpaceMono-Regular.ttf')
    })
  } catch (e) {
    // TODO(@defich/wallet): We might want to provide this error information to an error reporting service
    console.warn(e)
  }
}
