import { render } from '@testing-library/react-native'
import * as React from 'react'
import { LanguageSelectionScreen } from './LanguageSelectionScreen'

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn()
}))

jest.mock('../../../../../contexts/LanguageProvider', () => ({
  useLanguageContext: () => {
    return {
      language: 'en'
    }
  }
}))

jest.mock('../../../../../contexts/ThemeProvider')

describe('language selection screen', () => {
  it('should render', async () => {
    const rendered = render(<LanguageSelectionScreen />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
