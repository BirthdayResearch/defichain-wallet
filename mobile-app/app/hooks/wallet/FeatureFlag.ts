import { nativeApplicationVersion } from 'expo-application'
import { useGetFeatureFlagsQuery } from '@store/website'
import { satisfies } from 'semver'
import { EnvironmentName, getEnvironment } from '@environment'
import * as Updates from 'expo-updates'
import { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { FEATURE_FLAG_ID, FEATURE_FLAG_STAGE } from '@shared-types/website'

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
          return satisfies(appVersion, flag.version) && flag.id === featureId && matchStage(flag.stage)
        } else {
          return flag.id === featureId && matchStage(flag.stage)
        }
      })
    )
  }, [featureFlags, isSuccess])

  return isFeatureAvailable
}

function matchStage (featureFlagStage: FEATURE_FLAG_STAGE): boolean {
  if ((featureFlagStage === 'alpha' && !getEnvironment(Updates.releaseChannel).debug) ||
    (featureFlagStage === 'beta' && getEnvironment(Updates.releaseChannel).name !== EnvironmentName.Preview)) {
    return false
  } else {
    return true
  }
}
