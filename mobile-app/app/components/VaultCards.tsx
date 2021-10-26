import React from 'react'
import BigNumber from 'bignumber.js'
import { ThemedIcon, ThemedText, ThemedView } from './themed'
import { tailwind } from '@tailwind'
import { View } from '@components'
import { translate } from '@translations'

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
      <View style={tailwind('flex flex-row items-center')}>
        <View
          style={tailwind('bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center mr-2')}
        >
          <ThemedIcon
            iconType='MaterialIcons'
            name='shield'
            size={14}
            light={tailwind('text-gray-600')}
          />
        </View>
        <View style={tailwind('flex flex-col')}>
          <View style={tailwind('flex flex-row items-baseline')}>
            <ThemedText style={tailwind('font-semibold')}>
              {props.vaultAddress}
            </ThemedText>
            {props.status !== undefined &&
              (
                <VaultStatusTag status={props.status} />
              )}
          </View>
          <View style={tailwind('flex flex-row')}>
            <ThemedText style={tailwind('text-xs')}>
              {translate('components/VaultCard', 'Collaterals:')}
            </ThemedText>
            <CollateralsTokensIconGroup collaterals={props.collaterals} />
          </View>
        </View>
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
          'bg-warning-50': props.status === VaultStatus.AtRisk,
          'bg-success-50': props.status === VaultStatus.Safe
        }
      )}
      dark={tailwind(
        {
          'bg-gray-100': props.status === VaultStatus.Locked,
          'bg-darkwarning-50': props.status === VaultStatus.AtRisk,
          'bg-darksuccess-50': props.status === VaultStatus.Safe
        }
      )}
      style={tailwind('rounded-xl')}
    >
      {props.status === VaultStatus.Locked &&
        (
          <ThemedIcon
            iconType='MaterialIcons'
            name='lock'
            size={14}
            light={tailwind('text-gray-100')}
            dark={tailwind('text-gray-800')}
          />
        )}
      <ThemedText
        light={tailwind(
          {
            'text-gray-100': props.status === VaultStatus.Locked,
            'text-warning-600': props.status === VaultStatus.AtRisk,
            'text-success-600': props.status === VaultStatus.Safe
          }
        )}
        dark={tailwind(
          {
            'text-gray-100': props.status === VaultStatus.Locked,
            'text-darkwarning-600': props.status === VaultStatus.AtRisk,
            'text-darksuccess-600': props.status === VaultStatus.Safe
          }
        )}
        style={tailwind('px-2 py-1 font-medium text-xs')}
      >
        {translate('components/VaultCard', props.status)}
      </ThemedText>
    </ThemedView>
  )
}

function CollateralsTokensIconGroup (props: {collaterals: string[]}): JSX.Element {
  return (
    <View />
  )
}
