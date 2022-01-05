import { render } from '@testing-library/react-native'
import { EmptyBidsScreen } from './EmptyBidsScreen'

jest.mock('@shared-contexts/ThemeProvider')

describe('Empty bids', () => {
  it('should match snapshot', async () => {
    const rendered = render(<EmptyBidsScreen />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
