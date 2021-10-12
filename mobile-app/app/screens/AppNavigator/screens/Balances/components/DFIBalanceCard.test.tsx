import React from 'react'
import * as redux from 'react-redux'
import { render } from '@testing-library/react-native'
import { DFIBalanceCard } from './DFIBalanceCard'

jest.mock('@shared-contexts/ThemeProvider', () => ({
  useThemeContext: () => {
    return {
      isLight: true
    }
  }
}))
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn()
}))

describe('DFI Balance Card', () => {
  it('should match snapshot', async () => {
    const dfiToken = {
      id: '0',
      symbol: 'DFI',
      symbolKey: 'DFI',
      isDAT: true,
      isLPS: false,
      amount: '123.456',
      name: 'DeFiChain',
      displaySymbol: 'DFI (Token)',
      avatarSymbol: 'DFI (Token)'
    }
    const dfiUtxo = {
      id: '0_utxo',
      symbol: 'DFI',
      symbolKey: 'DFI',
      isDAT: true,
      isLPS: false,
      amount: '7.891011',
      name: 'DeFiChain',
      displaySymbol: 'DFI (UTXO)',
      avatarSymbol: 'DFI (UTXO)'
    }
    const spy = jest.spyOn(redux, 'useSelector')
    spy.mockReturnValueOnce(dfiToken)
    spy.mockReturnValueOnce(dfiUtxo)
    const rendered = render(<DFIBalanceCard />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
