import { render } from '@testing-library/react-native'
import { HeaderSearchIcon } from './HeaderSearchIcon'

jest.mock('@shared-contexts/ThemeProvider')

describe('Header search icon', () => {
  it('should match snapshot', () => {
    const rendered = render(
      <HeaderSearchIcon
        onPress={jest.fn()}
      />
    )
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
