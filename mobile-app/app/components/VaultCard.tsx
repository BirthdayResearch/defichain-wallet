import React from 'react'
import BigNumber from 'bignumber.js'
import { ThemedIcon, ThemedProps, ThemedText, ThemedView } from './themed'
import { tailwind } from '@tailwind'
import { View } from '@components'
import { translate } from '@translations'
import { TokenIconGroup } from './TokenIconGroup'
import NumberFormat from 'react-number-format'

interface VaultCardProps {
  vaultAddress: string
  status?: VaultStatus
  collaterals: string[]
  activeLoans: BigNumber
  totalLoanAmount: BigNumber
  collateralAmount: BigNumber
  collateralRatio: BigNumber
  actions: VaultAction[]
  onDetailPress: () => void
  onAddCollateral?: () => void
  onViewLoans?: () => void
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
      light={tailwind('bg-white')}
      dark={tailwind('bg-gray-800')}
      style={tailwind('p-4 rounded')}
    >
      <View style={tailwind('flex flex-row justify-between mb-4')}>
        <View style={tailwind('flex flex-row items-center')}>
          <ThemedView
            light={tailwind('bg-gray-100')}
            dark={tailwind('bg-gray-700')}
            style={tailwind('w-8 h-8 rounded-full flex items-center justify-center mr-2')}
          >
            <ThemedIcon
              iconType='MaterialIcons'
              name='shield'
              size={14}
              light={tailwind('text-gray-600')}
              dark={tailwind('text-gray-300')}
            />
          </ThemedView>
          <View style={tailwind('flex flex-col')}>
            <View style={tailwind('flex flex-row items-baseline')}>
              <ThemedText
                style={tailwind('font-semibold w-44 flex-shrink')}
                numberOfLines={1}
                ellipsizeMode='middle'
              >
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
              <TokenIconGroup symbols={props.collaterals} />
            </View>
          </View>
        </View>
        <View>
          <ThemedIcon iconType='MaterialIcons' name='chevron-right' size={20} style={tailwind('mt-1')} />
        </View>
      </View>
      <View style={tailwind('flex flex-row flex-wrap -mb-2')}>
        <VaultInfo label='Active loans' value={props.activeLoans} decimalPlace={0} />
        <VaultInfo label='Total loan amount' value={props.totalLoanAmount} prefix='$' decimalPlace={2} />
        <VaultInfo label='Collateral amount' value={props.collateralAmount} prefix='$' decimalPlace={2} />
        <VaultInfo
          label='Collateral ratio'
          value={props.collateralRatio}
          suffix='%'
          decimalPlace={2}
          valueThemedProps={getCollateralRatioColor(props.collateralRatio)}
        />
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
      style={tailwind('rounded-xl mx-2 flex flex-row items-center')}
    >
      {props.status === VaultStatus.Locked &&
        (
          <ThemedIcon
            iconType='MaterialIcons'
            name='lock'
            size={14}
            light={tailwind('text-gray-100')}
            dark={tailwind('text-gray-800')}
            style={tailwind('ml-2')}
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
            'text-gray-800': props.status === VaultStatus.Locked,
            'text-darkwarning-600': props.status === VaultStatus.AtRisk,
            'text-darksuccess-600': props.status === VaultStatus.Safe
          }
        )}
        style={tailwind('px-2 py-1 font-medium text-xs', { 'pl-1': props.status === VaultStatus.Locked })}
      >
        {translate('components/VaultCard', props.status)}
      </ThemedText>
    </ThemedView>
  )
}

function VaultInfo (props: {label: string, value: BigNumber, prefix?: string, suffix?: string, decimalPlace: number, valueThemedProps?: ThemedProps}): JSX.Element {
  return (
    <View style={tailwind('w-2/4 mb-2')}>
      <ThemedText
        light={tailwind('text-gray-500')}
        dark={tailwind('text-gray-400')}
        style={tailwind('text-xs')}
      >
        {translate('components/VaultCard', props.label)}
      </ThemedText>
      <NumberFormat
        value={props.value.toFixed(props.decimalPlace)}
        thousandSeparator
        decimalScale={2}
        displayType='text'
        suffix={props.suffix}
        prefix={props.prefix}
        renderText={value =>
          <ThemedText
            light={tailwind('text-gray-900')}
            dark={tailwind('text-gray-100')}
            {...props.valueThemedProps}
            style={tailwind('text-sm font-semibold')}
          >
            {value}
          </ThemedText>}
      />
    </View>
  )
}

function getCollateralRatioColor (value: BigNumber): ThemedProps {
  let lightStyle, darkStyle

  if (value.isLessThan(100)) {
    lightStyle = 'text-error-500'
    darkStyle = 'text-darkerror-500'
  } else if (value.isLessThan(300)) {
    lightStyle = 'text-warning-500'
    darkStyle = 'text-darkwarning-500'
  } else {
    lightStyle = 'text-success-500'
    darkStyle = 'text-darksuccess-500'
  }

  return {
    light: tailwind(lightStyle),
    dark: tailwind(darkStyle)
  }
}
