import { render } from '@testing-library/react-native'
import { Text } from 'react-native'
import ConnectionBoundary from './ConnectionBoundary'

jest.mock('@shared-contexts/ThemeProvider')

jest.mock('@react-native-community/netinfo', () => ({
  useNetInfo: jest.fn()
    .mockReturnValueOnce({
      type: 'test',
      isConnected: false
    })
    .mockReturnValueOnce({
      type: 'test',
      isConnected: true
    })
}))

describe('offline screen', () => {
  it('should match snapshot when offline', async () => {
    const rendered = render(<ConnectionBoundary />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })

  it('should return null when online', async () => {
    const tree = render(
      <ConnectionBoundary>
        <Text>
          Child Component
        </Text>
      </ConnectionBoundary>).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
