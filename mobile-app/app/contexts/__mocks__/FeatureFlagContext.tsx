import { FeatureFlagContextI } from '../FeatureFlagContext'
import { EnvironmentNetwork } from '@environment'

export function useFeatureFlagContext (): FeatureFlagContextI {
  return {
    hasBetaFeatures: false,
    featureFlags: [
      {
        id: 'future_swap',
        name: 'Future swap',
        stage: 'beta',
        version: '>=0.12.0',
        description: 'Browse loan tokens provided by DeFiChain',
        networks: [EnvironmentNetwork.LocalPlayground, EnvironmentNetwork.RemotePlayground],
        platforms: ['ios', 'android', 'web']
      }
    ],
    enabledFeatures: ['future_swap', 'dfi_loan_payment'],
    updateEnabledFeatures: jest.fn(),
    isFeatureAvailable: jest.fn(),
    isBetaFeature: jest.fn()
  }
}
