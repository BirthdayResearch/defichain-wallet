import { render } from '@testing-library/react-native'
import { InputHelperText } from './InputHelperText'

jest.mock('@shared-contexts/ThemeProvider')

describe('input helper text', () => {
  it('should render', async () => {
    const rendered = render(
      <InputHelperText
        testID='testID'
        label='foo'
        content='bar'
        suffix='suffix'
      />
    )
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
