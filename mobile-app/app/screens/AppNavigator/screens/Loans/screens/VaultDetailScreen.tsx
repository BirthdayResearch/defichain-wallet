import * as Clipboard from 'expo-clipboard'
import { View } from '@components'
import { ThemedIcon, ThemedProps, ThemedScrollView, ThemedText, ThemedView } from '@components/themed'
import { Collateral, VaultCardProps, VaultStatus } from '@components/VaultCard'
import { StackScreenProps } from '@react-navigation/stack'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import React, { useState } from 'react'
import { LoanParamList } from '../LoansNavigator'
import { TouchableOpacity } from 'react-native'
import BigNumber from 'bignumber.js'
import { SymbolIcon } from '../components/SymbolIcon'
import NumberFormat from 'react-number-format'
import { VaultInfo } from '../components/VaultInfo'
import { InfoText, InfoTextType } from '@components/InfoText'
import { ScrollableButton, ScrollButton } from '../components/ScrollableButton'
import { Tabs } from '@components/Tabs'

type Props = StackScreenProps<LoanParamList, 'VaultDetailScreen'>
enum TabKey {
  ActiveLoans = 'ACTIVE_LOANS',
  Details = 'DETAILS',
  Collaterals = 'COLLATERALS',
  Auctions = 'AUCTIONS'
}

export function VaultDetailScreen ({ route }: Props): JSX.Element {
  const {
    vaultId
  } = route.params
  const [activeTab, setActiveTab] = useState<string>(TabKey.ActiveLoans)
  const onPress = (tabId: string): void => {
    setActiveTab(tabId)
  }
  const currentVault: VaultCardProps = {
    vaultAddress: '22ffasd5ca123123123123123121231061',
    status: VaultStatus.AtRisk,
    collaterals: [
      { id: 'BTC', vaultProportion: new BigNumber(20) },
      { id: 'DFI', vaultProportion: new BigNumber(12.4573) },
      { id: 'dETH', vaultProportion: new BigNumber(55.123333) },
      { id: 'dLTC', vaultProportion: new BigNumber(20) },
      { id: 'dUSDC', vaultProportion: new BigNumber(20) }
    ],
    activeLoans: new BigNumber(3),
    totalLoanAmount: new BigNumber('50000'),
    collateralAmount: new BigNumber('40000'),
    collateralRatio: new BigNumber('10'),
    actions: ['ADD_COLLATERAL', 'VIEW_LOANS']
  }
  const vaultActionButtons: ScrollButton[] = [
    {
      iconName: 'add',
      iconType: 'MaterialIcons',
      label: 'ADD COLLATERAL'
    },
    {
      iconName: 'remove',
      iconType: 'MaterialIcons',
      label: 'TAKE COLLATERAL',
      disabled: currentVault.collaterals.length === 0
    },
    {
      iconName: 'tune',
      iconType: 'MaterialIcons',
      label: 'EDIT SCHEME',
      disabled: true
    }
  ]
  const vaultChildTabs = [
    {
      id: TabKey.ActiveLoans,
      label: 'Active loan',
      disabled: false,
      handleOnPress: onPress
    },
    {
      id: TabKey.Details,
      label: 'Details',
      disabled: false,
      handleOnPress: onPress
    },
    {
      id: TabKey.Collaterals,
      label: 'Collaterals',
      disabled: false,
      handleOnPress: onPress
    },
    {
      id: TabKey.Auctions,
      label: 'Auctions',
      disabled: true,
      handleOnPress: onPress
    }
  ]

  return (
    <ThemedScrollView
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-gray-800 border-gray-800')}
      style={tailwind('border-b')}
    >
      <View style={tailwind('p-4')}>
        <VaultIdSection vaultId={vaultId} collaterals={currentVault.collaterals} />
        <VaultCollateralTokenShare collaterals={currentVault.collaterals} />
        <VaultInfoSection {...currentVault} />
        <CollateralStatusMessage collateralRatio={currentVault.collateralRatio} />
      </View>
      <ThemedView
        light={tailwind('border-gray-200')}
        dark={tailwind('border-gray-700')}
        style={tailwind('pb-4 border-b')}
      >
        <ScrollableButton buttons={vaultActionButtons} containerStyle={tailwind('pl-4')} />
        <EmptyCollateralMessage collaterals={currentVault.collaterals} />
      </ThemedView>
      <Tabs tabSections={vaultChildTabs} activeTabKey={activeTab} />
      <ThemedView
        style={tailwind('h-full')}
      >
        {/* TODO: detail tab content */}
      </ThemedView>
    </ThemedScrollView>
  )
}

function VaultIdSection (props: { vaultId: string, collaterals: Collateral[] }): JSX.Element {
  return (
    <ThemedView
      light={tailwind('bg-white')}
      dark={tailwind('bg-gray-800')}
      style={tailwind('flex flex-row items-center')}
    >
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
      <View
        style={tailwind('flex flex-1')}
      >
        <View
          style={tailwind('flex flex-row mb-0.5')}
        >
          <ThemedText
            light={tailwind('text-gray-400')}
            dark={tailwind('text-gray-500')}
            style={tailwind('text-xs mr-1.5')}
          >
            {translate('screens/VaultDetailScreen', 'Vault ID')}
          </ThemedText>
          <TouchableOpacity onPress={() => copyToClipboard(props.vaultId)}>
            <ThemedIcon
              dark={tailwind('text-darkprimary-500')}
              iconType='MaterialIcons'
              light={tailwind('text-primary-500')}
              name='content-copy'
              size={18}
            />
          </TouchableOpacity>
        </View>
        <ThemedText
          style={tailwind('text-sm font-semibold')}
        >
          {props.vaultId}
        </ThemedText>
      </View>
    </ThemedView>
  )
}

function copyToClipboard (text: string): void {
  Clipboard.setString(text)
}

function VaultCollateralTokenShare (props: {collaterals: Collateral[]}): JSX.Element | null {
  if (props.collaterals.length === 0) {
    return null
  }

  return (
    <ThemedView
      light={tailwind('border-gray-200')}
      dark={tailwind('border-gray-700')}
      style={tailwind('flex flex-row flex-wrap mt-2 pb-3 border-b')}
    >
      {props.collaterals.map(collateral => (
        <ThemedView
          key={collateral.id}
          light={tailwind('bg-gray-50')}
          dark={tailwind('bg-gray-900')}
          style={tailwind('flex flex-row p-1 rounded-2xl mr-1 mb-1')}
        >
          <SymbolIcon symbol={collateral.id} />
          <ThemedText
            light={tailwind('text-gray-700')}
            dark={tailwind('text-gray-300')}
            style={tailwind('ml-1 mr-0.5 text-xs')}
          >
            {collateral.id}:
          </ThemedText>
          <NumberFormat
            value={collateral.vaultProportion.toFixed(2)}
            decimalScale={2}
            displayType='text'
            suffix='%'
            renderText={value =>
              <ThemedText
                light={tailwind('text-gray-700')}
                dark={tailwind('text-gray-300')}
                style={tailwind('text-xs font-medium')}
              >
                {value}
              </ThemedText>}
          />
        </ThemedView>
      ))}
    </ThemedView>
  )
}

function VaultInfoSection (props: VaultCardProps): JSX.Element | null {
  if (props.collaterals.length === 0) {
    return null
  }

  return (
    <View style={tailwind('flex flex-row flex-wrap -mb-2 mt-4')}>
      <VaultInfo label='Active loans' value={props.activeLoans} decimalPlace={0} />
      <VaultInfo label='Total loan amount' value={props.totalLoanAmount} prefix='$' decimalPlace={2} />
      <VaultInfo label='Collateral amount' value={props.collateralAmount} prefix='$' decimalPlace={2} />
      <VaultInfo
        label='Collateral ratio'
        value={props.collateralRatio}
        suffix='%'
        decimalPlace={2}
        valueThemedProps={props.collateralRatio !== undefined ? getCollateralRatioColor(props.collateralRatio) : undefined}
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
  }

  return {
    light: tailwind(lightStyle),
    dark: tailwind(darkStyle)
  }
}

function CollateralStatusMessage (props: {collateralRatio?: BigNumber}): JSX.Element | null {
  let message = ''
  let type: InfoTextType

  if (props.collateralRatio === undefined || props.collateralRatio?.isGreaterThanOrEqualTo(300)) {
    return null
  } else if (props.collateralRatio?.isLessThan(100)) {
    message = 'Your vault is locked for liquidation.'
    type = 'error'
  } else {
    message = 'Your vault is at risk of liquidation. Prevent liquidity by adding more collaterals or paying back loans.'
    type = 'warning'
  }

  return (
    <InfoText
      text={translate('screens/VaultDetailScreen', message)}
      type={type}
      style={tailwind('mt-2')}
    />
  )
}

function EmptyCollateralMessage (props: {collaterals: Collateral[]}): JSX.Element | null {
  if (props.collaterals.length !== 0) {
    return null
  }

  return (
    <View
      style={tailwind('mx-4')}
    >
      <InfoText
        text={translate('screens/VaultDetailScreen', 'Collaterals required to use this vault')}
        style={tailwind('mt-2')}
      />
    </View>
  )
}
