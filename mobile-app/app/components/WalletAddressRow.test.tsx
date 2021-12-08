import { render } from '@testing-library/react-native'
import React from 'react'
import { WalletAddressRow } from './WalletAddressRow'

jest.mock('@shared-contexts/ThemeProvider')
jest.mock('@shared-contexts/WalletContext')

describe('Wallet Address Row', () => {
  it('should match snapshot', async () => {
    const rendered = render(<WalletAddressRow />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
