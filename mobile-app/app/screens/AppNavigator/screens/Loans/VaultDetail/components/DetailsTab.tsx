import { View } from '@components'
import { NumberRow } from '@components/NumberRow'
import { TextRow } from '@components/TextRow'
import { ThemedSectionTitle } from '@components/themed'
import { formatBlockTime } from '@screens/AppNavigator/screens/Transactions/TransactionsScreen'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import React from 'react'

enum VaultHealth {
  Liquidated = 'Liquidated',
  AtRisk = 'At risk',
  Safe = 'Safe'
}

interface VaultDetailsDetail {
  minColRatio: BigNumber
  vaultInterest: BigNumber
  collateralRatio: BigNumber
  activeLoans: BigNumber
  totalLoanValue: BigNumber
  collateralValue: BigNumber
  valueHealth: VaultHealth
  created: number
}

export function DetailsTab (): JSX.Element {
  const details: VaultDetailsDetail = {
    minColRatio: new BigNumber(150),
    vaultInterest: new BigNumber(1.5),
    collateralRatio: new BigNumber(100000),
    activeLoans: new BigNumber(3),
    totalLoanValue: new BigNumber(75000),
    collateralValue: new BigNumber(75000),
    valueHealth: VaultHealth.Safe,
    created: 1635935161
  }

  return (
    <View style={tailwind('mb-16')}>
      <LoanSchemeSection minColRatio={details.minColRatio} vaultInterest={details.vaultInterest} />
      <VaultDetailSection {...details} />
    </View>
  )
}

function LoanSchemeSection (props: {minColRatio: BigNumber, vaultInterest: BigNumber}): JSX.Element {
  return (
    <>
      <ThemedSectionTitle
        text={translate('components/VaultDetailDetailsTab', 'LOAN SCHEME')}
      />
      <NumberRow
        lhs={translate('components/VaultDetailDetailsTab', 'Min. collateral ratio')}
        rhs={{
          value: props.minColRatio.toFixed(2),
          testID: 'text_min_col_ratio',
          suffixType: 'text',
          suffix: '%'
        }}
      />
      <NumberRow
        lhs={translate('components/VaultDetailDetailsTab', 'Vault interest')}
        rhs={{
          value: props.vaultInterest.toFixed(2),
          testID: 'text_min_col_ratio',
          suffixType: 'text',
          suffix: '%'
        }}
      />
    </>
  )
}

function VaultDetailSection (props: VaultDetailsDetail): JSX.Element {
  return (
    <>
      <ThemedSectionTitle
        text={translate('components/VaultDetailDetailsTab', 'VAULT DETAILS')}
      />
      <NumberRow
        lhs={translate('components/VaultDetailDetailsTab', 'Collateral ratio')}
        rhs={{
          value: props.collateralRatio.toFixed(2),
          testID: 'text_min_col_ratio',
          suffixType: 'text',
          suffix: '%'
        }}
      />
      <NumberRow
        lhs={translate('components/VaultDetailDetailsTab', 'Active loans')}
        rhs={{
          value: props.activeLoans.toFixed(0),
          testID: 'text_active_loans'
        }}
      />
      <NumberRow
        lhs={translate('components/VaultDetailDetailsTab', 'Total value of loans')}
        rhs={{
          value: props.totalLoanValue.toFixed(2),
          testID: 'text_total_loan_value'

        }}
      />
      <NumberRow
        lhs={translate('components/VaultDetailDetailsTab', 'Collateral value')}
        rhs={{
          value: props.collateralValue.toFixed(2),
          testID: 'text_collateral_value',
          prefix: '$'
        }}
      />
      <TextRow
        lhs={translate('components/VaultDetailDetailsTab', 'Vault health')}
        rhs={{
          value: translate('components/VaultDetailDetailsTab', props.valueHealth),
          testID: 'text_vault_health',
          themedProps: {
            light: tailwind(
              {
                'text-success-500': props.valueHealth === VaultHealth.Safe,
                'text-warning-500': props.valueHealth === VaultHealth.AtRisk,
                'text-error-500': props.valueHealth === VaultHealth.Liquidated
              }
            ),
            dark: tailwind(
              {
                'text-darksuccess-500': props.valueHealth === VaultHealth.Safe,
                'text-darkwarning-500': props.valueHealth === VaultHealth.AtRisk,
                'text-darkerror-500': props.valueHealth === VaultHealth.Liquidated
              }
            )
          }
        }}
        textStyle={tailwind('text-sm font-normal', {})}
      />
      <TextRow
        lhs={translate('components/VaultDetailDetailsTab', 'Created')}
        rhs={{
          value: formatBlockTime(props.created),
          testID: 'text_created'
        }}
        textStyle={tailwind('text-sm font-normal')}
      />
    </>
  )
}
