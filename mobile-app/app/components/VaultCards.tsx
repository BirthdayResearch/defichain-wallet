import React from 'react'
import BigNumber from 'bignumber.js'
import { ThemedIcon, ThemedText, ThemedView } from './themed'
import { tailwind } from '@tailwind'
import { View } from '@components'

interface VaultCardProps {
  vaultAddress: string
  status?: VaultStatus
  collaterals: string[]
  activeLoans: number
  totalLoanAmount: BigNumber
  collateralAmount: BigNumber
  collateralRatio: BigNumber
  actions: VaultAction[]
}

export enum VaultStatus {
  Locked = 'Locked',
  AtRisk = 'At risk',
  Safe = 'Safe'
}

type VaultAction = 'CREATE_COLLATERAL' | 'VIEW_LOANS'

export function VaultCard (props: VaultCardProps): JSX.Element {
  return (
    <ThemedView
      light={tailwind('bg-white rounded')}
      style={tailwind('p-4')}
    >
      <View
        style={tailwind('bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center')}
      >
        <ThemedIcon
          iconType='MaterialIcons'
          name='shield'
          size={14}
          light={tailwind('text-gray-600')}
        />
      </View>
      <View style={tailwind('flex flex-row')}>
        <ThemedText>
          {props.vaultAddress}
        </ThemedText>
        {props.status !== undefined &&
          (
            <VaultStatusTag status={props.status} />
          )}
      </View>
      <View>
        {/* arrow icon */}
      </View>
    </ThemedView>
  )
}

function VaultStatusTag (props: {status: VaultStatus}): JSX.Element {
  return (
    <ThemedView
      light={tailwind(
        {
          'bg-gray-700': props.status === VaultStatus.Locked,
          'bg-warning-50': props.status === VaultStatus.AtRisk
        }
      )}
      style={tailwind('rounded-xl')}
    />
  )
}
