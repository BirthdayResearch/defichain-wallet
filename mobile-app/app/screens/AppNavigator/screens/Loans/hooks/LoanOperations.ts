import { LoanVaultState } from '@defichain/whale-api-client/dist/api/loan'

export function useLoanOperations (state?: LoanVaultState): boolean {
  return state !== undefined ? ![LoanVaultState.IN_LIQUIDATION, LoanVaultState.UNKNOWN].includes(state) : false
}
