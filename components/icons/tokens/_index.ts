import { SvgProps } from 'react-native-svg'
import { IconBCH } from './IconBCH'
import { IconBTC } from './IconBTC'
import { IconDefault } from './IconDefault'
import { IconDFI } from './IconDFI'
import { IconDFIUTXO } from './IconDFIUTXO'
import { IconDOGE } from './IconDOGE'
import { IconETH } from './IconETH'
import { IconLTC } from './IconLTC'
import { IconUSDT } from './IconUSDT'

const mapping: Record<string, (props: SvgProps) => JSX.Element> = {
  BCH: IconBCH,
  BTC: IconBTC,
  DFI: IconDFI,
  DOGE: IconDOGE,
  ETH: IconETH,
  LTC: IconLTC,
  USDT: IconUSDT,
  UTXO: IconDFIUTXO
}

/**
 * ```ts
 * const Icon = getTokenIcon('DFI')
 *
 * return (
 *  <Icon />
 * )
 * ```
 *
 * TODO(@defich/wallet): move assets into it's own repo where anyone can create pull request into.
 *  Following a vector specification guideline, this allows anyone to create PR into that repo.
 *
 * @param {string} symbol of the assets
 * @param {string} id of token
 */
export function getTokenIcon (symbol: string, id?: string): (props: SvgProps) => JSX.Element {
  const symbolKey = id === '0_utxo' ? 'UTXO' : symbol
  const Icon = mapping[symbolKey]
  if (Icon === undefined) {
    return IconDefault(symbolKey)
  }
  return Icon
}
