import { render } from '@testing-library/react-native'
import React from 'react'
import { EmptyAuctionsScreen } from './EmptyAuctionsScreen'

jest.mock('@shared-contexts/ThemeProvider')

describe('Empty bids', () => {
  it('should match snapshot', async () => {
    const rendered = render(<EmptyAuctionsScreen />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
