import { render } from '@testing-library/react-native'
import React from 'react'
import { ConversionTag } from './ConversionTag'

jest.mock('../contexts/ThemeProvider')

describe('Conversion tag', () => {
  it('should match snapshot', async () => {
    const rendered = render(<ConversionTag />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
