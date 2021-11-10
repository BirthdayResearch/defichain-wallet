import { FeatureFlagContextI } from '../FeatureFlagContext'

export function useFeatureFlagContext (): FeatureFlagContextI {
  return {
    featureFlags: [
      {
        id: 'loan',
        name: 'Decentralized Loans',
        stage: 'beta',
        version: '>=0.12.0'
      }
    ],
    enabledFeatures: ['loan'],
    updateEnabledFeatures: jest.fn(),
    isFeatureAvailable: jest.fn(),
    isBetaFeature: jest.fn()
  }
}
