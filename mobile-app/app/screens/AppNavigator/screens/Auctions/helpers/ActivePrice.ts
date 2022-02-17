import { ActivePrice } from '@defichain/whale-api-client/dist/api/prices'

type ActivePriceType = 'ACTIVE' | 'NEXT'

export function getActivePrice (symbol: string, activePrice?: ActivePrice, type: ActivePriceType = 'ACTIVE'): string {
  const dUSDPrice = '1'
  if (symbol !== 'DUSD') {
    return (type === 'ACTIVE' ? activePrice?.active?.amount : activePrice?.next?.amount) ?? '0'
  }

  return dUSDPrice
}
