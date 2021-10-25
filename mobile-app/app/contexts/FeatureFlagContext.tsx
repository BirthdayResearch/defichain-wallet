import { EnvironmentName, getEnvironment } from '@environment'
import { FEATURE_FLAG_ID, FEATURE_FLAG_STAGE } from '@shared-types/website'
import { useGetFeatureFlagsQuery } from '@store/website'
import { nativeApplicationVersion } from 'expo-application'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { satisfies } from 'semver'
import * as Updates from 'expo-updates'

interface FeatureFlagContextI {
  isLoansDisplayed: boolean
  isAuctionDisplayed: boolean
}

const FeatureFlagContext = createContext<FeatureFlagContextI>(undefined as any)

export function useFeatureFlagContext (): FeatureFlagContextI {
  return useContext(FeatureFlagContext)
}

export function FeatureFlagProvider (props: React.PropsWithChildren<any>): JSX.Element | null {
  const {
    data: featureFlags,
    isSuccess,
    isLoading
  } = useGetFeatureFlagsQuery({})
  const appVersion = nativeApplicationVersion ?? '0.0.0'
  const [isLoansDisplayed, setIsLoansDisplayed] = useState<boolean>()
  const [isAuctionDisplayed, setIsAuctionDisplayed] = useState<boolean>()

  function isFeatureAvailable (featureId: FEATURE_FLAG_ID): boolean | undefined {
    if (featureFlags === undefined) {
      return undefined
    }

    return featureFlags.some((flag) => {
      if (Platform.OS !== 'web') {
        return satisfies(appVersion, flag.version) && flag.id === featureId && matchStage(flag.stage)
      } else {
        return flag.id === featureId && matchStage(flag.stage)
      }
    })
  }

  useEffect(() => {
    console.log('use effect', featureFlags, isSuccess, isLoading)
    if (!isSuccess || featureFlags === undefined) {
      setIsLoansDisplayed(false)
      setIsAuctionDisplayed(false)
      return
    }

    setIsLoansDisplayed(isFeatureAvailable('loan'))
    setIsAuctionDisplayed(isFeatureAvailable('auction'))
  }, [featureFlags, isSuccess])

  if (isLoansDisplayed === undefined || isAuctionDisplayed === undefined) {
    return null
  }

  const context: FeatureFlagContextI = {
    isLoansDisplayed: isLoansDisplayed,
    isAuctionDisplayed: isAuctionDisplayed
  }

  return (
    <FeatureFlagContext.Provider value={context}>
      {props.children}
    </FeatureFlagContext.Provider>
  )
}

function matchStage (featureFlagStage: FEATURE_FLAG_STAGE): boolean {
  if ((featureFlagStage === 'alpha' && !getEnvironment(Updates.releaseChannel).debug) ||
    (featureFlagStage === 'beta' && getEnvironment(Updates.releaseChannel).name !== EnvironmentName.Preview)) {
    return false
  }
  return true
}
