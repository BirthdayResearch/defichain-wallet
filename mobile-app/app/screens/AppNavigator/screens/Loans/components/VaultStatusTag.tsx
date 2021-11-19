import { ThemedText, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import React from 'react'
import { LoanVaultState } from '@defichain/whale-api-client/dist/api/loan'

export enum VaultStatus {
  Active = 'ACTIVE',
  Healthy = 'HEALTHY',
  AtRisk = 'AT RISK',
  Halted = 'HALTED',
  Liquidated = 'LIQUIDATED'
}

export const getStatusMapping = (status: LoanVaultState): VaultStatus => {
  switch (status) {
    case LoanVaultState.ACTIVE:
      return VaultStatus.Healthy
    case LoanVaultState.FROZEN:
      return VaultStatus.Halted
    case LoanVaultState.MAY_LIQUIDATE:
      return VaultStatus.AtRisk
    case LoanVaultState.IN_LIQUIDATION:
      return VaultStatus.Liquidated
    default:
      return VaultStatus.Healthy
  }
}

export function VaultStatusTag (props: { status: LoanVaultState }): JSX.Element {
  return (
    <ThemedView
      light={tailwind(
        {
          'bg-success-100': props.status === LoanVaultState.ACTIVE,
          'bg-warning-100': props.status === LoanVaultState.MAY_LIQUIDATE,
          'bg-gray-100': props.status === LoanVaultState.FROZEN,
          'bg-error-100': props.status === LoanVaultState.IN_LIQUIDATION
        }
      )}
      dark={tailwind(
        {
          'bg-darksuccess-100': props.status === LoanVaultState.ACTIVE,
          'bg-darkwarning-100': props.status === LoanVaultState.MAY_LIQUIDATE,
          'bg-gray-100': props.status === LoanVaultState.FROZEN,
          'bg-darkerror-100': props.status === LoanVaultState.IN_LIQUIDATION
        }
      )}
      style={tailwind('flex flex-row items-center')}
    >
      <ThemedText
        light={tailwind(
          {
            'text-success-500': props.status === LoanVaultState.ACTIVE,
            'text-warning-500': props.status === LoanVaultState.MAY_LIQUIDATE,
            'text-gray-400': props.status === LoanVaultState.FROZEN,
            'text-error-500': props.status === LoanVaultState.IN_LIQUIDATION
          }
        )}
        dark={tailwind(
          {
            'text-darksuccess-500': props.status === LoanVaultState.ACTIVE,
            'text-darkwarning-500': props.status === LoanVaultState.MAY_LIQUIDATE,
            'text-gray-500': props.status === LoanVaultState.FROZEN,
            'text-darkerror-500': props.status === LoanVaultState.IN_LIQUIDATION
          }
        )}
        style={tailwind('px-2 py-0.5 font-medium text-xs')}
      >
        {translate('components/VaultCard', getStatusMapping(props.status))}
      </ThemedText>
    </ThemedView>
  )
}
