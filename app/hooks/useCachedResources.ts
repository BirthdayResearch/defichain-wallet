import {
  IBMPlexSans_300Light,
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
  IBMPlexSans_700Bold
} from '@expo-google-fonts/ibm-plex-sans'
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
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
      ...MaterialCommunityIcons.font,
      ...MaterialIcons.font,
      LightFont: IBMPlexSans_300Light,
      RegularFont: IBMPlexSans_400Regular,
      MediumFont: IBMPlexSans_500Medium,
      SemiBoldFont: IBMPlexSans_600SemiBold,
      BoldFont: IBMPlexSans_700Bold
    })
  } catch (e) {
    // TODO(@defich/wallet): We might want to provide this error information to an error reporting service
    console.warn(e)
  }
}
