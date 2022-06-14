import { render } from '@testing-library/react-native'
import { HeaderSettingButton } from './HeaderSettingButton'

jest.mock('@shared-contexts/ThemeProvider')
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    setOptions: jest.fn()
  })
}))

describe('Header Setting Button', () => {
  it('should match snapshot', async () => {
    const component = (
      <HeaderSettingButton />
    )
    const rendered = render(component)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
