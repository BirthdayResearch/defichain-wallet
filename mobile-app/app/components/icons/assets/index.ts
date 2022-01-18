import { SvgProps } from 'react-native-svg'
import { _Default } from './_Default'
import { dBCH } from './dBCH'
import { dBTC } from './dBTC'
import { BTC } from './BTC'
import { dDFI } from './dDFI'
import { dDOGE } from './dDOGE'
import { dETH } from './dETH'
import { DFI } from './DFI'
import { dLTC } from './dLTC'
import { dUSDC } from './dUSDC'
import { dUSDT } from './dUSDT'
import { dUSD } from './dUSD'

const mapping: Record<string, (props: SvgProps) => JSX.Element> = {
  _UTXO: DFI,
  DFI: dDFI,
  'DFI (UTXO)': DFI,
  'DFI (Token)': dDFI,
  BTC: BTC,
  dBCH: dBCH,
  dBTC: dBTC,
  dDFI: dDFI,
  dDOGE: dDOGE,
  dETH: dETH,
  dLTC: dLTC,
  dUSDT: dUSDT,
  dUSDC: dUSDC,
  dDUSD: dUSD,
  DUSD: dUSD
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
