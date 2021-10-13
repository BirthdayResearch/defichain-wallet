import { render } from '@testing-library/react-native'
import React from 'react'
import { InfoText } from './InfoText'

jest.mock('@shared-contexts/ThemeProvider')

describe('info text', () => {
  it('should match snapshot', async () => {
    const rendered = render(<InfoText text='foo' />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
