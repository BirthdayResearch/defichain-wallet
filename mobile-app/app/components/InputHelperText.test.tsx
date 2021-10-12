import { render } from '@testing-library/react-native'
import React from 'react'
import { InputHelperText } from './InputHelperText'

jest.mock('@shared-contexts/ThemeProvider', () => ({
  useThemeContext: () => {
    return {
      isLight: true
    }
  }
}))

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
