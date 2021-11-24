import { View } from '@components'
import { NumberRow } from '@components/NumberRow'
import { TextRow } from '@components/TextRow'
import { ThemedSectionTitle } from '@components/themed'
import { LoanVaultActive, LoanVaultState } from '@defichain/whale-api-client/dist/api/loan'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import React from 'react'
import { useVaultStatus } from '../../components/VaultStatusTag'
import { useNextCollateralizationRatio } from '../../hooks/NextCollateralizationRatio'
import { CollateralizationRatioRow } from '../../components/CollateralizationRatioRow'

export function DetailsTab ({ vault }: { vault: LoanVaultActive }): JSX.Element {
  const nextCollateralizationRatio = useNextCollateralizationRatio(vault.collateralAmounts, vault.loanAmounts)

  return (
    <View style={tailwind('mb-16')}>
      <VaultDetailsSection
        minColRatio={new BigNumber(vault.loanScheme.minColRatio)}
        vaultInterest={new BigNumber(vault.loanScheme.interestRate)}
      />
      <CollateralizationRatioSection
        collateralizationRatio={new BigNumber(vault.collateralRatio)}
        nextCollateralizationRatio={new BigNumber(nextCollateralizationRatio)}
        totalCollateralsValue={new BigNumber(vault.collateralValue)}
        numberOfLoans={vault.loanAmounts.length}
        totalLoansValue={new BigNumber(vault.loanValue)}
        vaultState={vault.state}
        minColRatio={new BigNumber(vault.loanScheme.minColRatio)}
      />
    </View>
  )
}

function VaultDetailsSection (props: { minColRatio: BigNumber, vaultInterest: BigNumber }): JSX.Element {
  return (
    <>
      <ThemedSectionTitle
        text={translate('components/VaultDetailDetailsTab', 'VAULT DETAILS')}
      />
      <NumberRow
        lhs={translate('components/VaultDetailDetailsTab', 'Min. collateralization ratio')}
        rhs={{
          value: props.minColRatio.toFixed(2),
          testID: 'text_min_col_ratio',
          suffixType: 'text',
          suffix: '%',
          style: tailwind('ml-0')
        }}
        info={{
          title: 'Min. collateralization ratio',
          message: 'Minimum required collateralization ratio based on loan scheme selected. A vault will go into liquidation when the collateralization ratio goes below the minimum requirement.'
        }}
      />
      <NumberRow
        lhs={translate('components/VaultDetailDetailsTab', 'Vault interest')}
        rhs={{
          value: props.vaultInterest.toFixed(2),
          testID: 'text_min_col_ratio',
          suffixType: 'text',
          suffix: '%',
          style: tailwind('ml-0')
        }}
        info={{
          title: 'Annual vault interest',
          message: 'Annual vault interest rate based on the loan scheme selected.'
        }}
      />
    </>
  )
}

interface CollateralizationRatioSectionProps {
  collateralizationRatio: BigNumber
  nextCollateralizationRatio: BigNumber
  totalCollateralsValue: BigNumber
  numberOfLoans: number
  totalLoansValue: BigNumber
  vaultState: LoanVaultState
  minColRatio: BigNumber
}

function CollateralizationRatioSection (props: CollateralizationRatioSectionProps): JSX.Element {
  const currentVaultState = useVaultStatus(props.vaultState, props.collateralizationRatio, props.minColRatio, props.totalLoansValue)
  const nextVaultState = useVaultStatus(props.vaultState, props.nextCollateralizationRatio, props.minColRatio, props.totalLoansValue)
  return (
    <>
      <ThemedSectionTitle
        text={translate('components/VaultDetailDetailsTab', 'COLLATERALIZATION DETAILS')}
      />
      {props.collateralizationRatio.isLessThan(0)
        ? (
          <TextRow
            lhs={translate('screens/VaultDetailDetailsTab', 'Collateralization ratio')}
            rhs={{
              value: translate('components/VaultDetailDetailsTab', 'N/A'),
              testID: 'text_col_ratio'
            }}
            textStyle={tailwind('text-sm font-normal')}
            info={{
              title: 'Collateralization ratio',
              message: 'The collateralization ratio represents the amount of collaterals deposited in a vault in relation to the loan amount, expressed in percentage.'
            }}
          />
        )
        : (
          <CollateralizationRatioRow
            label={translate('components/VaultDetailDetailsTab', 'Collateralization ratio')}
            value={props.collateralizationRatio.toFixed(2)}
            testId='text_col_ratio'
            type='current'
            vaultState={currentVaultState}
          />
        )}
      {props.nextCollateralizationRatio.isLessThan(0)
        ? (
          <TextRow
            lhs={translate('screens/VaultDetailDetailsTab', 'Next collateralization')}
            rhs={{
              value: translate('components/VaultDetailDetailsTab', 'N/A'),
              testID: 'text_next_col'
            }}
            textStyle={tailwind('text-sm font-normal')}
            info={{
              title: 'Next collateralization',
              message: 'Next collateralization ratio represents the vault\'s collateralization ratio based on the prices of the collateral/loan token(s) in the next hour.'
            }}
          />
        )
        : (
          <CollateralizationRatioRow
            label={translate('components/VaultDetailDetailsTab', 'Next collateralization')}
            value={props.nextCollateralizationRatio.toFixed(2)}
            testId='text_next_col'
            type='next'
            vaultState={nextVaultState}
          />
        )}
      <NumberRow
        lhs={translate('components/VaultDetailDetailsTab', 'Total collateral (USD)')}
        rhs={{
          value: props.totalCollateralsValue.toFixed(2),
          testID: 'text_collateral_value',
          prefix: '$'
        }}
      />
      <NumberRow
        lhs={translate('components/VaultDetailDetailsTab', 'Active loans')}
        rhs={{
          value: props.numberOfLoans,
          testID: 'text_active_loans'
        }}
      />
      <NumberRow
        lhs={translate('components/VaultDetailDetailsTab', 'Total loans (USD)')}
        rhs={{
          value: props.totalLoansValue.toFixed(2),
          testID: 'text_total_loan_value',
          prefix: '$'
        }}
      />
    </>
  )
}
