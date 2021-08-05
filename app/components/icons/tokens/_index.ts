import { SvgProps } from 'react-native-svg'
import { IconBCH } from './IconBCH'
import { IconBTC } from './IconBTC'
import { IconDefault } from './IconDefault'
import { IconDFI } from './IconDFI'
import { IconDOGE } from './IconDOGE'
import { IconETH } from './IconETH'
import { IconLTC } from './IconLTC'
import { IconUSDT } from './IconUSDT'
import { IconUTXO } from './IconUTXO'
import { IconUSDC } from './IconUSDC'

const mapping: Record<string, (props: SvgProps) => JSX.Element> = {
  BCH: IconBCH,
  BTC: IconBTC,
  DFI: IconDFI,
  DOGE: IconDOGE,
  ETH: IconETH,
  LTC: IconLTC,
  USDT: IconUSDT,
  _UTXO: IconUTXO,
  USDC: IconUSDC
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
 */
export function getTokenIcon (symbol: string): (props: SvgProps) => JSX.Element {
  const Icon = mapping[symbol]
  if (Icon === undefined) {
    return IconDefault(symbol)
  }
  return Icon
}
