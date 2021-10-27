import { render } from '@testing-library/react-native'
import React from 'react'
import { EmptyVault } from './EmptyVault'

jest.mock('@shared-contexts/ThemeProvider')

describe('Empty vault', () => {
  it('should match snapshot', async () => {
    const rendered = render(<EmptyVault handleRefresh={() => jest.fn} loadingStatus='' />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
