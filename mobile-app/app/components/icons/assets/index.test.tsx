import { render } from '@testing-library/react-native'
import * as React from 'react'
import { AppIcon } from '../AppIcon'
import { getNativeIcon } from './index'

jest.mock('randomcolor', () => jest.fn().mockReturnValue('#ffffff'))

const icons = ['_UTXO', 'DFI', 'DFI (UTXO)', 'DFI (Token)', 'BTC', 'dBCH', 'dBTC', 'dDFI', 'dDOGE', 'dETH', 'dLTC',
  'dUSDT', 'dUSDC', 'FAKE', 'dTSLA',
  'dAAPL', 'dAMD', 'dGME', 'dBABA',
  'dGOOG', 'dDUSD', 'DUSD', 'dPLTR', 'dARKK', 'dAMZN', 'dCOIN',
  'dFB', 'dTWTR', 'dNVDA', 'dMSFT', 'dGLD', 'dPDBC', 'dQQQ', 'dSLV', 'dSPY', 'dTLT', 'dURTH', 'dVNQ']

describe('token icons', () => {
  icons.forEach(icon => {
    it(`getNativeIcon("${icon}") should get <Icon${icon} /> snapshot`, () => {
      const Icon = getNativeIcon(icon)
      const tree = render(<Icon />).toJSON()
      expect(tree).toMatchSnapshot()
    })
  })

  it('<AppIcon /> should match snapshot', () => {
    const tree = render(<AppIcon />).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
