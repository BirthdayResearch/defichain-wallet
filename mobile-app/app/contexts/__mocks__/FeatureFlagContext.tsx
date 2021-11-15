import { FeatureFlagContextI } from '../FeatureFlagContext'
import { EnvironmentNetwork } from '@environment'

export function useFeatureFlagContext (): FeatureFlagContextI {
  return {
    featureFlags: [
      {
        id: 'loan',
        name: 'Decentralized Loans',
        stage: 'beta',
        version: '>=0.12.0',
        description: 'Browse loan tokens provided by DeFiChain',
        networks: [EnvironmentNetwork.LocalPlayground, EnvironmentNetwork.RemotePlayground],
        platforms: ['ios', 'android', 'web']
      }
    ],
    enabledFeatures: ['loan'],
    updateEnabledFeatures: jest.fn(),
    isFeatureAvailable: jest.fn(),
    isBetaFeature: jest.fn()
  }
}
