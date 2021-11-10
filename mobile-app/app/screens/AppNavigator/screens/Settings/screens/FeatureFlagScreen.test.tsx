import { render } from '@testing-library/react-native'
import * as React from 'react'
import { FeatureFlagScreen, FeatureFlagItem, BetaFeaturesI } from './FeatureFlagScreen'

jest.mock('@shared-contexts/ThemeProvider')
jest.mock('@contexts/FeatureFlagContext')

describe('feature flag screen', () => {
  it('should render FeatureFlagItem', async () => {
    const feature: BetaFeaturesI = {
      id: 'loan',
      name: 'Decentralized Loans',
      stage: 'beta',
      version: '>=0.12.0',
      description: 'Browse loan tokens provided by DeFiChain',
      value: true
    }
    const rendered = render(<FeatureFlagItem item={feature} onChange={() => {}} />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })

  it('should render FeatureFlagScreen', async () => {
    const rendered = render(<FeatureFlagScreen />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
