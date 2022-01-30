import { render } from '@testing-library/react-native'
import { LanguageSelectionScreen } from './LanguageSelectionScreen'

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn()
}))

jest.mock('@shared-contexts/LanguageProvider')
jest.mock('@shared-contexts/ThemeProvider')

describe('language selection screen', () => {
  it('should render', async () => {
    const rendered = render(<LanguageSelectionScreen />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
