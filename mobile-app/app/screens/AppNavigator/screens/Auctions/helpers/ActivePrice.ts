import { ActivePrice } from '@defichain/whale-api-client/dist/api/prices'

export function getActivePrice (symbol: string, activePrice?: ActivePrice): string {
  const dUSDPrice = '0.99'
  if (symbol !== 'DUSD') {
    return activePrice?.active?.amount ?? '0'
  }

  return dUSDPrice
}
