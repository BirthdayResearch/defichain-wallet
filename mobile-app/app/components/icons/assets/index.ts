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
import { dTSLA } from './dTSLA'
import { dUSD } from './dUSD'
import { dAAPL } from './dAAPL'
import { dAMD } from './dAMD'
import { dGME } from '@components/icons/assets/dGME'
import { dBABA } from '@components/icons/assets/dBABA'
import { dGOOG } from '@components/icons/assets/dGOOG'
import { dPLTR } from '@components/icons/assets/dPLTR'
import { dARKK } from '@components/icons/dARKK'
import { dAMZN } from '@components/icons/assets/dAMZN'
import { dCOIN } from '@components/icons/assets/dCOIN'
import { dFB } from '@components/icons/assets/dFB'
import { dTWTR } from '@components/icons/assets/dTWTR'
import { dNVDA } from '@components/icons/assets/dNVDA'
import { dMSFT } from '@components/icons/assets/dMSFT'

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
  dTSLA: dTSLA,
  dAAPL: dAAPL,
  dAMD: dAMD,
  dGME: dGME,
  dBABA: dBABA,
  dGOOG: dGOOG,
  dDUSD: dUSD,
  DUSD: dUSD,
  dPLTR: dPLTR,
  dARKK: dARKK,
  dAMZN: dAMZN,
  dCOIN: dCOIN,
  dFB: dFB,
  dTWTR: dTWTR,
  dNVDA: dNVDA,
  dMSFT: dMSFT
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
