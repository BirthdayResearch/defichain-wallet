import { LoanVaultTokenAmount } from '@defichain/whale-api-client/dist/api/loan'

export function getActivePrice (loanVaultToken: LoanVaultTokenAmount): string {
  if (loanVaultToken.symbol !== 'DUSD') {
    return loanVaultToken.activePrice?.active?.amount ?? '0'
  }

  return '1'
}
