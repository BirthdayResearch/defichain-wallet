import { render } from '@testing-library/react-native'
import React from 'react'
import { EmptyAuction } from './EmptyAuction'

jest.mock('@shared-contexts/ThemeProvider')

describe('Empty bids', () => {
  it('should match snapshot', async () => {
    const rendered = render(<EmptyAuction />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
