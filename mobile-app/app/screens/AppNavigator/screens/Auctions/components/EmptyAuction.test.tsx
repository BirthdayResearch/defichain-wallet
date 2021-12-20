import { render } from '@testing-library/react-native'
import React from 'react'
import { EmptyAuction } from './EmptyAuction'

jest.mock('@shared-contexts/ThemeProvider')
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn()
}))
describe('Empty bids', () => {
  it('should match snapshot', async () => {
    const rendered = render(<EmptyAuction />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
