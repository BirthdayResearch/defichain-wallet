import { nativeApplicationVersion } from 'expo-application'
import { useGetFeatureFlagsQuery } from '@store/website'
import { satisfies } from 'semver'
import { EnvironmentName, getEnvironment } from '@environment'
import * as Updates from 'expo-updates'

type FEATURE_FLAG_ID = 'loan'
type FEATURE_FLAG_STAGE = 'alpha' | 'beta' | 'public'

export function useFeatureFlag (featureId: FEATURE_FLAG_ID): boolean {
  const {
    data: featureFlags,
    isSuccess
  } = useGetFeatureFlagsQuery({})
  const appVersion = nativeApplicationVersion ?? '0.0.0'

  if (!isSuccess || featureFlags === undefined) {
    return false
  }

  return featureFlags.some((flag) => {
    return satisfies(appVersion, flag.version) && flag.id === featureId && matchEnvironment(flag.stage)
  })
}

function matchEnvironment (featureFlagStage: FEATURE_FLAG_STAGE): boolean {
  if (featureFlagStage === 'public') {
    return true
  } else if (featureFlagStage === 'beta' && getEnvironment(Updates.releaseChannel).name === EnvironmentName.Preview) {
    return true
  } else if (featureFlagStage === 'alpha' && getEnvironment(Updates.releaseChannel).debug) {
    return true
  } else {
    return false
  }
}
