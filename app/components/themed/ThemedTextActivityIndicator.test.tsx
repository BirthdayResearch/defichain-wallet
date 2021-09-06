import { render } from '@testing-library/react-native'
import * as React from 'react'
import { ThemedTextActivityIndicator } from './ThemedTextActivityIndicator'

jest.mock('../../contexts/ThemeProvider')
describe('themed text activity', () => {
  it('should match snapshot', async () => {
    const component = (
      <ThemedTextActivityIndicator
        message='Hello World'
      />
    )
    const rendered = render(component)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
