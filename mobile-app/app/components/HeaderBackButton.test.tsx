import { render } from '@testing-library/react-native'
import { HeaderBackButton } from './HeaderBackButton'

jest.mock('@shared-contexts/ThemeProvider')

describe('Header back button', () => {
  it('should match snapshot', () => {
    const rendered = render(
      <HeaderBackButton />
    )
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
