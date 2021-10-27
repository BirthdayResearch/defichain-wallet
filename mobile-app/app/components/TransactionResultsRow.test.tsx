import { render } from '@testing-library/react-native'
import React from 'react'
import { TransactionResultsRow } from './TransactionResultsRow'

jest.mock('../contexts/ThemeProvider')

describe('Transaction Results Row', () => {
  it('should match snapshot', async () => {
    const tokens = [
      {
        symbol: 'DFI',
        value: '0.00000001',
        suffix: 'DFI'
      },
      {
        symbol: 'dBTC',
        value: '0.00000001',
        suffix: 'dBTC'
      }
    ]
    const rendered = render(<TransactionResultsRow tokens={tokens} />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
