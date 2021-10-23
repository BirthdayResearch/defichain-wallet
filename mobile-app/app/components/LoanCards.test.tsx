import { render } from '@testing-library/react-native'
import React from 'react'
import { LoanCardOptions, LoanCards } from './LoanCards'
import BigNumber from 'bignumber.js'

jest.mock('../contexts/ThemeProvider')

describe('loan cards', () => {
  it('should match snapshot', async () => {
    const loanCards: LoanCardOptions[] = [
      {
        loanName: 'BTC',
        priceType: 'ACTIVE',
        price: new BigNumber('123.4567'),
        isVerified: true,
        interestRate: new BigNumber('1.2345'),
        onPress: () => jest.fn
      },
      {
        loanName: 'BTC',
        priceType: 'NEXT',
        price: new BigNumber('123.4567'),
        isVerified: false,
        interestRate: new BigNumber('1.2345'),
        onPress: () => jest.fn
      },
      {
        loanName: 'BTC',
        priceType: 'ACTIVE',
        price: new BigNumber('123.4567'),
        isVerified: true,
        interestRate: new BigNumber('1.2345'),
        onPress: () => jest.fn
      }
    ]
    const rendered = render(<LoanCards loans={loanCards} />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
