import { SvgProps } from 'react-native-svg'
import { _Default } from './_Default'
import { BTC } from './BTC'
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
  BTC: BTC,
  DFI: DFI,
  dBCH: dBCH,
  dBTC: dBTC,
  dDFI: dDFI,
  dDOGE: dDOGE,
  dETH: dETH,
  dLTC: dLTC,
  dUSDT: dUSDT,
  dUSDC: dUSDC
}

/**
 * ```ts
 * const Icon = getAssetIcon('DFI')
 * const dIcon = getAssetIcon('dDOGE')
 *
 * return (
 *  <dIcon />
 * )
 * ```
 *
 * TODO(@defich): move assets into it's own repo where anyone can create pull request into.
 *  Following a vector specification guideline, this allows anyone to create PR into that repo.
 *
 * @param {string} symbol of the asset icon
 * @return {(props: SvgProps) => JSX.Element}
 */
export function getAssetIcon (symbol: string): (props: SvgProps) => JSX.Element {
  return getNativeIcon(`d${symbol}`)
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
