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
import { dGME } from './dGME'
import { dBABA } from './dBABA'
import { dGOOG } from './dGOOG'
import { dPLTR } from './dPLTR'
import { dARKK } from './dARKK'
import { dAMZN } from './dAMZN'
import { dCOIN } from './dCOIN'
import { dFB } from './dFB'
import { dTWTR } from './dTWTR'
import { dNVDA } from './dNVDA'
import { dMSFT } from './dMSFT'
import { dSPY } from './dSPY'
import { dQQQ } from './dQQQ'
import { dGLD } from './dGLD'
import { dSLV } from './dSLV'
import { dPDBC } from './dPDBC'
import { dVNQ } from './dVNQ'
import { dURTH } from './dURTH'
import { dTLT } from './dTLT'

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
  dMSFT: dMSFT,
  dSPY: dSPY,
  dQQQ: dQQQ,
  dGLD: dGLD,
  dSLV: dSLV,
  dPDBC: dPDBC,
  dVNQ: dVNQ,
  dURTH: dURTH,
  dTLT: dTLT
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
