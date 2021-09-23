import { render } from '@testing-library/react-native'
import * as React from 'react'
import { DexGuidelines } from './DexGuidelines'

jest.mock('../../../../contexts/ThemeProvider')
jest.mock('../../../../contexts/DexContext', () => ({
  useDexProvider: () => {
    return {
      displayGuidelines: true,
      setDisplayGuidelines: jest.fn
    }
  }
}))

describe('Dex guide', () => {
  it('should match snapshot', () => {
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
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
