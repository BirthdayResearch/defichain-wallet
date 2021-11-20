import { View } from '@components'
import { NumberRow } from '@components/NumberRow'
import { TextRow } from '@components/TextRow'
import { ThemedSectionTitle, ThemedText, ThemedView } from '@components/themed'
import { LoanVaultActive, LoanVaultState } from '@defichain/whale-api-client/dist/api/loan'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import React from 'react'
import NumberFormat from 'react-number-format'
import { useVaultStatus, VaultStatus, VaultStatusTag } from '../../components/VaultStatusTag'
import { useNextCollateralizationRatio } from '../../hooks/NextCollateralizationRatio'

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
          />
        )
        : (
          <CollateralizationRatioRow
            label={translate('components/VaultDetailDetailsTab', 'Collateralization ratio')}
            value={props.collateralizationRatio.toFixed(2)}
            testId='text_col_ratio'
            type='current'
            status={currentVaultState}
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
          />
        )
        : (
          <CollateralizationRatioRow
            label={translate('components/VaultDetailDetailsTab', 'Next collateralization')}
            value={props.nextCollateralizationRatio.toFixed(2)}
            testId='text_next_col'
            type='next'
            status={nextVaultState}
          />
        )}
      <NumberRow
        lhs={translate('components/VaultDetailDetailsTab', 'Total collaterals (USD)')}
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

interface CollateralizationRatioRowProps {
  label: string
  value: string
  testId: string
  type: 'current' | 'next'
  status: VaultStatus
}

function CollateralizationRatioRow (props: CollateralizationRatioRowProps): JSX.Element {
  return (
    <ThemedView
      dark={tailwind('bg-gray-800 border-gray-700')}
      light={tailwind('bg-white border-gray-200')}
      style={tailwind('p-4 flex-row items-start w-full border-b')}
    >
      <View style={tailwind('w-6/12')}>
        <ThemedText
          style={tailwind('text-sm')}
          testID={`${props.testId}_label`}
        >
          {props.label}
        </ThemedText>
      </View>

      <View
        style={tailwind('flex-1 flex-row justify-end flex-wrap items-center')}
      >
        <NumberFormat
          value={props.value}
          decimalScale={2}
          thousandSeparator
          displayType='text'
          suffix='%'
          renderText={(val: string) => (
            <View style={tailwind('flex flex-row items-center flex-1 flex-wrap justify-end')}>
              <ThemedText
                dark={tailwind('text-gray-400')}
                light={tailwind('text-gray-500')}
                style={tailwind('text-sm text-right mr-1')}
                testID={props.testId}
              >
                {props.type === 'next' && '~'}{val}
              </ThemedText>
              <VaultStatusTag status={props.status} />
            </View>
          )}
        />
      </View>
    </ThemedView>
  )
}
