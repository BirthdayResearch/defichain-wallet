import { EnvironmentNetwork } from '@environment'
import { render } from '@testing-library/react-native'
import { RowNetworkItem } from './RowNetworkItem'

jest.mock('@shared-contexts/ThemeProvider')
jest.mock('@shared-contexts/NetworkContext')
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn()
}))

describe('Row network item', () => {
  it('should match snapshot', () => {
    const rendered = render(<RowNetworkItem alertMessage='Foo' network={EnvironmentNetwork.LocalPlayground} />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
