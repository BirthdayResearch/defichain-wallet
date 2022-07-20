import { getEnvironment } from '@environment'
import { FeatureFlag, FEATURE_FLAG_ID } from '@shared-types/website'
import { useGetFeatureFlagsQuery, usePrefetch } from '@store/website'
import { nativeApplicationVersion } from 'expo-application'
import { createContext, ReactElement, useContext, useEffect, useState } from 'react'
import * as React from 'react'
import { Platform } from 'react-native'
import { satisfies } from 'semver'
import { FeatureFlagPersistence } from '@api'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { getReleaseChannel } from '@api/releaseChannel'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { useServiceProviderContext } from './StoreServiceProvider'

const MAX_RETRY = 3
export interface FeatureFlagContextI {
  featureFlags: FeatureFlag[]
  enabledFeatures: FEATURE_FLAG_ID[]
  updateEnabledFeatures: (features: FEATURE_FLAG_ID[]) => void
  isFeatureAvailable: (featureId: FEATURE_FLAG_ID) => boolean
  isBetaFeature: (featureId: FEATURE_FLAG_ID) => boolean
  hasBetaFeatures: boolean
}

const FeatureFlagContext = createContext<FeatureFlagContextI>(undefined as any)

export function useFeatureFlagContext (): FeatureFlagContextI {
  return useContext(FeatureFlagContext)
}

export function FeatureFlagProvider (props: React.PropsWithChildren<any>): JSX.Element | null {
  const { network } = useNetworkContext()
  const { url, isCustomUrl } = useServiceProviderContext()
  const {
    data: featureFlags = [],
    isLoading,
    isError,
    refetch
  } = useGetFeatureFlagsQuery(`${network}.${url}`)
  const modifiedFeatureFlags = featureFlags.map((flag) => {
    if (flag.id === 'loan') {
      const modFlag: FeatureFlag = { ...flag, stage: 'beta' }
      return modFlag
    } else {
      return flag
    }
  })
  const logger = useLogger()

  const prefetchPage = usePrefetch('getFeatureFlags')
  const appVersion = nativeApplicationVersion ?? '0.0.0'
  const [enabledFeatures, setEnabledFeatures] = useState<FEATURE_FLAG_ID[]>([])
  const [retries, setRetries] = useState(0)

  useEffect(() => {
    if (isError && retries < MAX_RETRY) {
      setTimeout(() => {
        prefetchPage({})
        setRetries(retries + 1)
      }, 10000)
    } else if (!isError) {
      prefetchPage({})
    }
  }, [isError])

  useEffect(() => {
    refetch()
  }, [network])

  function isBetaFeature (featureId: FEATURE_FLAG_ID): boolean {
    return modifiedFeatureFlags.some((flag: FeatureFlag) => satisfies(appVersion, flag.version) &&
      flag.networks?.includes(network) && flag.id === featureId && flag.stage === 'beta')
  }

  function isFeatureAvailable (featureId: FEATURE_FLAG_ID): boolean {
    return modifiedFeatureFlags.some((flag: FeatureFlag) => {
      if (flag.networks?.includes(network) && flag.platforms?.includes(Platform.OS)) {
        if (Platform.OS === 'web') {
          return flag.id === featureId && checkFeatureStage(flag)
        }
        return satisfies(appVersion, flag.version) && flag.id === featureId && checkFeatureStage(flag)
      }
      return false
    })
  }

  function checkFeatureStage (feature: FeatureFlag): boolean {
    switch (feature.stage) {
      case 'alpha':
        return getEnvironment(getReleaseChannel()).debug
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

  /*
    If service provider === custom, we keep showing the app regardless if feature flags loaded to ensure app won't be stuck on white screen
    Note: return null === app will be stuck at white screen until the feature flags API are applied
  */
  if (isLoading && !isCustomUrl) {
    return null
  }

  const context: FeatureFlagContextI = {
    featureFlags: modifiedFeatureFlags,
    enabledFeatures,
    updateEnabledFeatures,
    isFeatureAvailable,
    isBetaFeature,
    hasBetaFeatures: modifiedFeatureFlags.some((flag) => satisfies(appVersion, flag.version) &&
      flag.networks?.includes(network) && flag.platforms?.includes(Platform.OS) && flag.stage === 'beta')
  }

  if (isError && !isLoading && retries < MAX_RETRY) {
    return <></>
  }

  return (
    <FeatureFlagContext.Provider value={context}>
      {props.children}
    </FeatureFlagContext.Provider>
  )
}

export function FeatureGate ({
  children,
  feature
}: { children: ReactElement, feature: FEATURE_FLAG_ID }): JSX.Element | null {
  const { isFeatureAvailable } = useFeatureFlagContext()
  return isFeatureAvailable(feature) ? children : null
}
