import { render, waitFor } from '@testing-library/react-native'
import * as React from 'react'
import { DexGuidelines } from './DexGuidelines'

jest.mock('../../../../contexts/ThemeProvider')
jest.mock('../../../../api', () => ({
  DisplayDexGuidelinesPersistence: {
    get: async () => {
      return true
    }
  }
}))

describe('Dex guide', () => {
  it('should match snapshot', async () => {
    const navigation: any = {
      navigate: jest.fn()
    }
    const route: any = {}
    const rendered = render(
      <DexGuidelines
        navigation={navigation}
        route={route}
      />
    )
    await waitFor(() => rendered.toJSON() !== null)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
