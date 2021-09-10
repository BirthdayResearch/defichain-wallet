import { render } from '@testing-library/react-native'
import React from 'react'
import { RecoveryWordFaq } from './RecoveryWordsFaq'

jest.mock('../contexts/ThemeProvider')

describe('recovery words faq', () => {
  it('should render and match snapshot', async () => {
    const rendered = render(<RecoveryWordFaq />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
