import { nativeApplicationVersion } from 'expo-application'
import { useGetFeatureFlagsQuery } from '@store/website'
import { satisfies } from 'semver'
import { EnvironmentName, getEnvironment } from '@environment'
import * as Updates from 'expo-updates'
import { useEffect, useState } from 'react'
import { Platform } from 'react-native'

type FEATURE_FLAG_ID = 'loan'
type FEATURE_FLAG_STAGE = 'alpha' | 'beta' | 'public'

export function useFeatureFlag (featureId: FEATURE_FLAG_ID): boolean {
  const {
    data: featureFlags,
    isSuccess
  } = useGetFeatureFlagsQuery({})
  const appVersion = nativeApplicationVersion ?? '0.0.0'
  const [isFeatureAvailable, setFeatureAvailable] = useState(false)

  useEffect(() => {
    if (!isSuccess || featureFlags === undefined) {
      setFeatureAvailable(false)
      return
    }

    setFeatureAvailable(
      featureFlags.some((flag) => {
        if (Platform.OS !== 'web') {
          return satisfies(appVersion, flag.version) && flag.id === featureId && matchEnvironment(flag.stage)
        } else {
          return flag.id === featureId && matchEnvironment(flag.stage)
        }
      })
    )
  }, [featureFlags, isSuccess])

  return isFeatureAvailable
}

function matchEnvironment (featureFlagStage: FEATURE_FLAG_STAGE): boolean {
  if (featureFlagStage === 'public') {
    return true
  } else if (featureFlagStage === 'beta' && getEnvironment(Updates.releaseChannel).name === EnvironmentName.Preview) {
    return true
  } else if (featureFlagStage === 'alpha' && getEnvironment(Updates.releaseChannel).debug) {
    return true
  } else {
    console.log('failed matchEnvironment')
    return false
  }
}
