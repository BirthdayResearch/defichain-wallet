import BigNumber from 'bignumber.js'
import { render } from '@testing-library/react-native'
import React from 'react'
import { VaultInfo } from './VaultInfo'

jest.mock('@shared-contexts/ThemeProvider')
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn()
}))

describe('Vault info', () => {
  it('should render label with numeric value', async () => {
    const rendered = render(
      <VaultInfo
        label='Foo'
        valueType='NUMBER'
        value={new BigNumber('123.456789')}
        suffix='%'
        prefix='$'
      />
    )
    expect(rendered.toJSON()).toMatchSnapshot()
  })

  it('should render label with token icon group', async () => {
    const rendered = render(
      <VaultInfo
        label='Foo'
        valueType='TOKEN_ICON_GROUP'
        tokens={['BTC', 'dLTC', 'dDOGE', 'dETH', 'dBCH', 'DFI']}
        suffix='%'
        prefix='$'
      />
    )
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
