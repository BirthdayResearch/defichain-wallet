import { getEnvironment } from '@environment'
import { FeatureFlag, FEATURE_FLAG_ID } from '@shared-types/website'
import { useGetFeatureFlagsQuery, usePrefetch } from '@store/website'
import { nativeApplicationVersion } from 'expo-application'
import React, { createContext, ReactElement, useContext, useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { satisfies } from 'semver'
import * as Updates from 'expo-updates'
import { FeatureFlagPersistence } from '@api'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'

interface FeatureFlagContextI {
  featureFlags: FeatureFlag[]
  enabledFeatures: FEATURE_FLAG_ID[]
  updateEnabledFeatures: (features: FEATURE_FLAG_ID[]) => void
  isFeatureAvailable: (featureId: FEATURE_FLAG_ID) => boolean
}

const FeatureFlagContext = createContext<FeatureFlagContextI>(undefined as any)

export function useFeatureFlagContext (): FeatureFlagContextI {
  return useContext(FeatureFlagContext)
}

export function FeatureFlagProvider (props: React.PropsWithChildren<any>): JSX.Element | null {
  const {
    data: featureFlags = [],
    isLoading,
    isError
  } = useGetFeatureFlagsQuery({})
  const logger = useLogger()

  const prefetchPage = usePrefetch('getFeatureFlags')
  const appVersion = nativeApplicationVersion ?? '0.0.0'
  const [enabledFeatures, setEnabledFeatures] = useState<FEATURE_FLAG_ID[]>([])

  if (!isError) {
    prefetchPage({})
  }

  function isFeatureAvailable (featureId: FEATURE_FLAG_ID): boolean {
    if (featureFlags.length === 0 || featureFlags?.some === undefined) {
      return false
    }

    return featureFlags.some((flag) => {
      if (Platform.OS === 'web') {
        return flag.id === featureId && checkFeatureStage(flag)
      } else {
        return satisfies(appVersion, flag.version) && flag.id === featureId && checkFeatureStage(flag)
      }
    })
  }

  function checkFeatureStage (feature: FeatureFlag): boolean {
    switch (feature.stage) {
      case 'alpha':
        return getEnvironment(Updates.releaseChannel).debug
      case 'beta':
        return enabledFeatures.includes(feature.id)
      case 'public':
        return true
      default:
        return false
    }
  }

  const updateEnabledFeatures = async (flags: FEATURE_FLAG_ID[]): Promise<void> => {
    setEnabledFeatures(flags)
    await FeatureFlagPersistence.set(flags)
  }

  useEffect(() => {
    FeatureFlagPersistence.get()
    .then((features) => {
      setEnabledFeatures(features)
    })
    .catch((err) => logger.error(err))
  }, [])

  if (isLoading) {
    return null
  }

  const context: FeatureFlagContextI = {
    featureFlags,
    enabledFeatures,
    updateEnabledFeatures,
    isFeatureAvailable
  }

  return (
    <FeatureFlagContext.Provider value={context}>
      {props.children}
    </FeatureFlagContext.Provider>
  )
}

export function FeatureGate ({ children, feature }: { children: ReactElement, feature: FEATURE_FLAG_ID }): JSX.Element | null {
  const { isFeatureAvailable } = useFeatureFlagContext()
  return isFeatureAvailable(feature) ? children : null
}
