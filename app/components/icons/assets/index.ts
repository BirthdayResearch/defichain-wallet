import { SvgProps } from 'react-native-svg'
import { _Default } from './_Default'
import { dBCH } from './dBCH'
import { dBTC } from './dBTC'
import { dDFI } from './dDFI'
import { dDOGE } from './dDOGE'
import { dETH } from './dETH'
import { DFI } from './DFI'
import { dLTC } from './dLTC'
import { dUSDC } from './dUSDC'
import { dUSDT } from './dUSDT'

const mapping: Record<string, (props: SvgProps) => JSX.Element> = {
  _UTXO: DFI,
  DFI: dDFI,
  BCH: dBCH,
  dBCH: dBCH,
  BTC: dBTC,
  dBTC: dBTC,
  dDFI: dDFI,
  DOGE: dDOGE,
  dDOGE: dDOGE,
  ETH: dETH,
  dETH: dETH,
  LTC: dLTC,
  dLTC: dLTC,
  USDT: dUSDT,
  dUSDT: dUSDT,
  USDC: dUSDC,
  dUSDC: dUSDC
}

/**
 * @param {string} symbol of the native asset icon
 * @return {(props: SvgProps) => JSX.Element}
 */
export function getNativeIcon (symbol: string): (props: SvgProps) => JSX.Element {
  const Icon = mapping[symbol]
  if (Icon === undefined) {
    return _Default(symbol)
  }
  return Icon
}
