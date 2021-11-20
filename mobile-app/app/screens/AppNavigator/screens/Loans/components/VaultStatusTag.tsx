import { ThemedText, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import React from 'react'
import { LoanVaultState } from '@defichain/whale-api-client/dist/api/loan'
import BigNumber from 'bignumber.js'
import { useCollateralRatioStats } from '@screens/AppNavigator/screens/Loans/hooks/CollateralizationRatio'

export enum VaultStatus {
  Active = 'ACTIVE',
  Healthy = 'HEALTHY',
  AtRisk = 'AT RISK',
  Halted = 'HALTED',
  NearLiquidation = 'AT RISK',
  Liquidated = 'IN LIQUIDATION',
  Unknown = 'UNKNOWN'
}

export function useVaultStatus (status: LoanVaultState, collateralRatio: BigNumber, minColRatio: BigNumber, totalLoanAmount: BigNumber): VaultStatus {
  const colRatio = collateralRatio.gte(0) ? collateralRatio : new BigNumber(0)
  const stats = useCollateralRatioStats({
    colRatio,
    minColRatio,
    totalLoanAmount
  })
  if (status === LoanVaultState.FROZEN) {
    return VaultStatus.Halted
  } else if (status === LoanVaultState.UNKNOWN) {
    return VaultStatus.Unknown
  } else if (status === LoanVaultState.IN_LIQUIDATION) {
    return VaultStatus.Liquidated
  } else if (stats.isInLiquidation) {
    return VaultStatus.NearLiquidation
  } else if (stats.isAtRisk) {
    return VaultStatus.AtRisk
  } else if (stats.isHealthy) {
    return VaultStatus.Healthy
  } else {
    return VaultStatus.Active
  }
}

export function VaultStatusTag ({ status }: { status: VaultStatus }): JSX.Element {
  if (status === VaultStatus.Unknown) {
    return <></>
  }
  return (
    <ThemedView
      light={tailwind(
        {
          'bg-blue-100': status === VaultStatus.Active,
          'bg-success-100': status === VaultStatus.Healthy,
          'bg-warning-100': status === VaultStatus.AtRisk,
          'bg-gray-100': status === VaultStatus.Halted,
          'bg-error-100': status === VaultStatus.Liquidated || status === VaultStatus.NearLiquidation
        }
      )}
      dark={tailwind(
        {
          'bg-darkblue-100': status === VaultStatus.Active,
          'bg-darksuccess-100': status === VaultStatus.Healthy,
          'bg-darkwarning-100': status === VaultStatus.AtRisk,
          'bg-gray-100': status === VaultStatus.Halted,
          'bg-darkerror-100': status === VaultStatus.Liquidated || status === VaultStatus.NearLiquidation
        }
      )}
      style={tailwind('flex flex-row items-center')}
    >
      <ThemedText
        light={tailwind(
          {
            'text-blue-500': status === VaultStatus.Active,
            'text-success-500': status === VaultStatus.Healthy,
            'text-warning-500': status === VaultStatus.AtRisk,
            'text-gray-400': status === VaultStatus.Halted,
            'text-error-500': status === VaultStatus.Liquidated || status === VaultStatus.NearLiquidation
          }
        )}
        dark={tailwind(
          {
            'text-darkblue-500': status === VaultStatus.Active,
            'text-darksuccess-500': status === VaultStatus.Healthy,
            'text-darkwarning-500': status === VaultStatus.AtRisk,
            'text-gray-500': status === VaultStatus.Halted,
            'text-darkerror-500': status === VaultStatus.Liquidated || status === VaultStatus.NearLiquidation
          }
        )}
        style={tailwind('px-2 py-0.5 font-medium text-xs')}
      >
        {translate('components/VaultCard', status)}
      </ThemedText>
    </ThemedView>
  )
}
