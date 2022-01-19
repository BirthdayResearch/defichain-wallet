import { render } from '@testing-library/react-native'
import { PinTextInput } from './PinTextInput'

jest.mock('@shared-contexts/ThemeProvider')

describe('Pin text input', () => {
  it('should match snapshot', () => {
    const rendered = render(
      <PinTextInput
        cellCount={6}
        onChange={jest.fn()}
        testID='pin_input'
        value='foo'
      />
    )
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
