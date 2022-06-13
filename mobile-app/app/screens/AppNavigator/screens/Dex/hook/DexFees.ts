import BigNumber from 'bignumber.js'
import { DexFee } from '../components/DexFeesBreakdownRow'

interface DexFeesProps {
  tokenADisplaySymbol?: string
  tokenAAmount: string
  tokenBDisplaySymbol?: string
  tokenBAmount: string
}

/**
 * Calculate instant swap fees for pairs below:
 * 1) DUSD - DFI pair
 * 2) dToken - DUSD pairs
 * 3) dBTC - DFI pair
 */
export function useDexFees ({ tokenADisplaySymbol, tokenAAmount, tokenBDisplaySymbol, tokenBAmount }: DexFeesProps): DexFee[] {
  const dexFees: DexFee[] = []

  if ((tokenADisplaySymbol === 'DFI' && tokenBDisplaySymbol === 'DUSD') ||
    (tokenADisplaySymbol === 'DUSD' && tokenBDisplaySymbol === 'DFI')) {
    dexFees.push({
      amount: new BigNumber(tokenADisplaySymbol === 'DUSD' ? tokenAAmount : tokenBAmount).multipliedBy(0.005), // 5% of DUSD
      suffix: tokenADisplaySymbol === 'DUSD' ? tokenADisplaySymbol : tokenBDisplaySymbol
    })
  } else if (tokenADisplaySymbol === 'DUSD' || tokenBDisplaySymbol === 'DUSD') {
    dexFees.push({
      amount: new BigNumber(tokenAAmount).multipliedBy(0.001), // 1%
      suffix: tokenADisplaySymbol ?? ''
    }, {
      amount: new BigNumber(tokenBAmount).multipliedBy(0.001), // 1%
      suffix: tokenBDisplaySymbol ?? ''
    })
  } else if ((tokenADisplaySymbol === 'dBTC' && tokenBDisplaySymbol === 'DFI') ||
    (tokenADisplaySymbol === 'DFI' && tokenBDisplaySymbol === 'dBTC')) {
      dexFees.push({
        amount: new BigNumber(tokenADisplaySymbol === 'dBTC' ? tokenAAmount : tokenBAmount).multipliedBy(0.001), // 1% of dBTC
        suffix: tokenADisplaySymbol === 'dBTC' ? tokenADisplaySymbol : tokenBDisplaySymbol
      })
    }

    return dexFees
}
