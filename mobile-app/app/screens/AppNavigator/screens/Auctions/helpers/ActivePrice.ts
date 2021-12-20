import { ActivePrice } from '@defichain/whale-api-client/dist/api/prices'

export function getActivePrice (symbol: string, activePrice?: ActivePrice): string {
  if (symbol !== 'DUSD') {
    return activePrice?.active?.amount ?? '0'
  }

  return '1'
}
