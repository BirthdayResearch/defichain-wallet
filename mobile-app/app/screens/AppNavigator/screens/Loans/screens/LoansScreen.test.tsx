import { render } from '@testing-library/react-native'
import * as React from 'react'
import { LoansScreen } from './LoansScreen'

jest.mock('../../../../../contexts/ThemeProvider')

describe('Loans screen', () => {
  it('should render', async () => {
    const component = (
      <LoansScreen />
    )
    const rendered = render(component)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
