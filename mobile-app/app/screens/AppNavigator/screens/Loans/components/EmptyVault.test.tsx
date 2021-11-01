import { render } from '@testing-library/react-native'
import React from 'react'
import { EmptyVault } from './EmptyVault'

jest.mock('@shared-contexts/ThemeProvider')
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn()
}))

describe('Empty vault', () => {
  it('should match snapshot', async () => {
    const rendered = render(<EmptyVault handleRefresh={() => jest.fn} isLoading={false} />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
