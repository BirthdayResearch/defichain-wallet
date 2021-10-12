import { render } from '@testing-library/react-native'
import * as React from 'react'
import { RecoveryWordsFaq } from './RecoveryWordsFaq'

jest.mock('@shared-contexts/ThemeProvider', () => ({
  useThemeContext: () => {
    return {
      isLight: true
    }
  }
}))
describe('recovery words faq', () => {
  it('should match snapshot', () => {
    const rendered = render(<RecoveryWordsFaq />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
