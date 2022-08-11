import { render } from '@testing-library/react-native'
import { SwapButtonV2 } from './SwapButtonV2'

jest.mock('@shared-contexts/ThemeProvider')
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn()
}))

describe('Swap Button V2', () => {
  it('should match snapshot', () => {
    const rendered = render(<SwapButtonV2 />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
