import { render } from '@testing-library/react-native'
import { DexActionButton } from './DexActionButton'

jest.mock('@shared-contexts/ThemeProvider')
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn()
}))

describe('Dex Action Button', () => {
  it('should match snapshot', () => {
    const onPress = jest.fn()

    const rendered = render(<DexActionButton testID='Composite_Swap_2' onPress={() => onPress()} label='Swap' />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
