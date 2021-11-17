import { ThemedText, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import React from 'react'

export enum VaultStatus {
  Active = 'ACTIVE',
  Healthy = 'HEALTHY',
  AtRisk = 'AT RISK',
  Halted = 'HALTED',
  Liquidated = 'LIQUIDATED'
}

export function VaultStatusTag (props: {status: VaultStatus}): JSX.Element {
  return (
    <ThemedView
      light={tailwind(
        {
          'bg-blue-100': props.status === VaultStatus.Active,
          'bg-success-100': props.status === VaultStatus.Healthy,
          'bg-warning-100': props.status === VaultStatus.AtRisk,
          'bg-gray-100': props.status === VaultStatus.Halted,
          'bg-error-100': props.status === VaultStatus.Liquidated
        }
      )}
      dark={tailwind(
        {
          'bg-darkblue-100': props.status === VaultStatus.Active,
          'bg-darksuccess-100': props.status === VaultStatus.Healthy,
          'bg-darkwarning-100': props.status === VaultStatus.AtRisk,
          'bg-gray-100': props.status === VaultStatus.Halted,
          'bg-darkerror-100': props.status === VaultStatus.Liquidated
        }
      )}
      style={tailwind('flex flex-row items-center')}
    >
      <ThemedText
        light={tailwind(
          {
            'text-blue-500': props.status === VaultStatus.Active,
            'text-success-500': props.status === VaultStatus.Healthy,
            'text-warning-500': props.status === VaultStatus.AtRisk,
            'text-dfxgray-400': props.status === VaultStatus.Halted,
            'text-error-500': props.status === VaultStatus.Liquidated
          }
        )}
        dark={tailwind(
          {
            'text-darkblue-500': props.status === VaultStatus.Active,
            'text-darksuccess-500': props.status === VaultStatus.Healthy,
            'text-darkwarning-500': props.status === VaultStatus.AtRisk,
            'text-dfxgray-500': props.status === VaultStatus.Halted,
            'text-darkerror-500': props.status === VaultStatus.Liquidated
          }
        )}
        style={tailwind('px-2 py-0.5 font-medium text-xs')}
      >
        {translate('components/VaultCard', props.status)}
      </ThemedText>
    </ThemedView>
  )
}
