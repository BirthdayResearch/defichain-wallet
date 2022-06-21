import { Logging } from '@api'
import {
  IBMPlexSans_300Light,
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
  IBMPlexSans_700Bold
} from '@expo-google-fonts/ibm-plex-sans'
import {
  Sora_300Light,
  Sora_400Regular,
  Sora_500Medium,
  Sora_600SemiBold,
  Sora_700Bold
} from '@expo-google-fonts/sora'
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
      BoldFont: IBMPlexSans_700Bold,
      SoraLight: Sora_300Light,
      SoraRegular: Sora_400Regular,
      SoraMedium: Sora_500Medium,
      SoraSemiBold: Sora_600SemiBold,
      SoraBold: Sora_700Bold
    })
  } catch (e) {
    Logging.error(e)
  }
}
