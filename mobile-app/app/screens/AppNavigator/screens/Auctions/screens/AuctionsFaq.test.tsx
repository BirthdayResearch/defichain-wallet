import { render } from '@testing-library/react-native'
import React from 'react'
import { AuctionsFaq } from './Auctions'

jest.mock('@shared-contexts/ThemeProvider')

describe('Auctions FAQ screen', () => {
  it('should match snapshot', async () => {
    const rendered = render(<AuctionsFaq />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
