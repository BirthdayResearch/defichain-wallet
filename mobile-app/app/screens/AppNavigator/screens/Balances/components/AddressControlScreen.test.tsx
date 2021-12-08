import React from 'react'
import { render } from '@testing-library/react-native'
import { AddressControlCard, AddressControlModal, AddressControlScreen, AddressItemRow } from './AddressControlScreen'

jest.mock('@shared-contexts/ThemeProvider')
jest.mock('@shared-contexts/WalletContext')
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn()
}))

describe('DFI address control', () => {
  it('should match snapshot for Address Control Screen', async () => {
    const rendered = render(<AddressControlScreen />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })

  it('should match snapshot for Address Control Modal', async () => {
    const onClose = jest.fn()
    const rendered = render(<AddressControlModal onClose={onClose} />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })

  it('should match snapshot for Address Control Card', async () => {
    const onClose = jest.fn()
    const rendered = render(<AddressControlCard onClose={onClose} />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })

  it('should match snapshot for Address Item Row', async () => {
    const onPress = jest.fn()
    const rendered = render(
      <AddressItemRow
        address='bcrt1q8rfsfny80jx78cmk4rsa069e2ckp6rn83u6ut9'
        isActive
        index={0}
        onPress={onPress}
      />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
