import { ThemedIcon, ThemedText, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'

import { LoanVaultState } from '@defichain/whale-api-client/dist/api/loan'
import BigNumber from 'bignumber.js'
import {
  CollateralizationRatioStats,
  useCollateralRatioStats
} from '@screens/AppNavigator/screens/Loans/hooks/CollateralizationRatio'
import { VaultStatus } from '../VaultStatusTypes'

interface VaultHealthItem {
  vaultStats: CollateralizationRatioStats
  status: VaultStatus
}

export function useVaultStatus (status: LoanVaultState, collateralRatio: BigNumber, minColRatio: BigNumber, totalLoanAmount: BigNumber, totalCollateralValue: BigNumber): VaultHealthItem {
  const colRatio = collateralRatio.gte(0) ? collateralRatio : new BigNumber(0)
  const stats = useCollateralRatioStats({
    colRatio,
    minColRatio,
    totalLoanAmount,
    totalCollateralValue
  })
  let vaultStatus: VaultStatus
  if (status === LoanVaultState.FROZEN) {
    vaultStatus = VaultStatus.Halted
  } else if (status === LoanVaultState.UNKNOWN) {
    vaultStatus = VaultStatus.Unknown
  } else if (status === LoanVaultState.IN_LIQUIDATION) {
    vaultStatus = VaultStatus.Liquidated
  } else if (stats.isInLiquidation) {
    vaultStatus = VaultStatus.NearLiquidation
  } else if (stats.isAtRisk) {
    vaultStatus = VaultStatus.AtRisk
  } else if (stats.isHealthy) {
    vaultStatus = VaultStatus.Healthy
  } else if (stats.isReady) {
    vaultStatus = VaultStatus.Ready
  } else {
    vaultStatus = VaultStatus.Empty
  }
  return {
    status: vaultStatus,
    vaultStats: stats
  }
}

export function VaultStatusTag ({
  status,
  testID
}: {status: VaultStatus, testID?: string}): JSX.Element {
  if (status === VaultStatus.Unknown) {
    return <></>
  }

  return (
    <ThemedView
      light={tailwind(
        {
          'bg-gray-100': status === VaultStatus.Empty || status === VaultStatus.Ready || status === VaultStatus.Halted || status === VaultStatus.Liquidated,
          'bg-success-100': status === VaultStatus.Healthy,
          'bg-warning-100': status === VaultStatus.AtRisk,
          'bg-error-100': status === VaultStatus.NearLiquidation
        }
      )}
      dark={tailwind(
        {
          'bg-gray-900': status === VaultStatus.Empty || status === VaultStatus.Ready || status === VaultStatus.Halted || status === VaultStatus.Liquidated,
          'bg-darksuccess-100': status === VaultStatus.Healthy,
          'bg-darkwarning-100': status === VaultStatus.AtRisk,
          'bg-darkerror-100': status === VaultStatus.NearLiquidation
        }
      )}
      style={tailwind('flex flex-row items-center py-0.5 px-2')}
    >
      <ThemedText
        testID={testID}
        light={tailwind(
          {
            'text-gray-500': status === VaultStatus.Empty || status === VaultStatus.Ready || status === VaultStatus.Liquidated,
            'text-gray-400': status === VaultStatus.Halted,
            'text-success-500': status === VaultStatus.Healthy,
            'text-warning-500': status === VaultStatus.AtRisk,
            'text-error-600': status === VaultStatus.NearLiquidation
          }
        )}
        dark={tailwind(
          {
            'text-gray-400': status === VaultStatus.Empty || status === VaultStatus.Ready || status === VaultStatus.Liquidated,
            'text-gray-500': status === VaultStatus.Halted,
            'text-darksuccess-500': status === VaultStatus.Healthy,
            'text-darkwarning-500': status === VaultStatus.AtRisk,
            'text-darkerror-600': status === VaultStatus.NearLiquidation
          }
        )}
        style={tailwind('font-medium text-xs')}
      >
        {getTagLabel(status)}
      </ThemedText>
      <SignalIcon status={status} />
    </ThemedView>
  )
}

function getTagLabel (status: VaultStatus): string {
  if (status !== VaultStatus.Healthy && status !== VaultStatus.AtRisk && status !== VaultStatus.NearLiquidation) {
    return translate('components/VaultCard', status)
  }

  return translate('components/VaultCard', 'ACTIVE')
}

function SignalIcon (props: {status: VaultStatus}): JSX.Element | null {
  const signalIconSize = 14
  if (props.status === VaultStatus.Healthy) {
    return (
      <ThemedIcon
        iconType='MaterialCommunityIcons'
        name='signal-cellular-3'
        light={tailwind('text-success-500')}
        dark={tailwind('text-darksuccess-500')}
        style={tailwind('ml-1 pt-px')}
        size={signalIconSize}
        testID={`vault_tag_${props.status}`}
      />
    )
  }

  if (props.status === VaultStatus.AtRisk) {
    return (
      <ThemedIcon
        iconType='MaterialCommunityIcons'
        name='signal-cellular-2'
        light={tailwind('text-warning-500')}
        dark={tailwind('text-darkwarning-500')}
        style={tailwind('ml-1 pt-px')}
        size={signalIconSize}
        testID={`vault_tag_${props.status}`}
      />
    )
  }

  if (props.status === VaultStatus.NearLiquidation) {
    return (
      <ThemedIcon
        iconType='MaterialCommunityIcons'
        name='signal-cellular-1'
        light={tailwind('text-error-600')}
        dark={tailwind('text-darkerror-600')}
        style={tailwind('ml-1 pt-px')}
        size={signalIconSize}
        testID={`vault_tag_${props.status}`}
      />
    )
  }

  if (props.status === VaultStatus.Halted) {
    return (
      <ThemedIcon
        iconType='MaterialCommunityIcons'
        name='signal-cellular-3'
        light={tailwind('text-gray-300')}
        dark={tailwind('text-gray-600')}
        style={tailwind('ml-1 pt-px')}
        size={signalIconSize}
        testID={`vault_tag_${props.status}`}
      />
    )
  }

  return null
}
