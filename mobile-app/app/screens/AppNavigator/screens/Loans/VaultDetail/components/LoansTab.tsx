import React from 'react'
import BigNumber from 'bignumber.js'
import { ThemedIcon, ThemedText, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { View } from '@components'
import { SymbolIcon } from '@components/SymbolIcon'
import { IconButton } from '@components/IconButton'
import { translate } from '@translations'
import { TouchableOpacity } from 'react-native'
import { LoanVault } from '@store/loans'
import { LoanVaultState } from '@defichain/whale-api-client/dist/api/loan'
import { VaultSectionTextRow } from '../../components/VaultSectionTextRow'
import { EmptyLoan } from './EmptyLoan'

interface LoanCardProps {
  symbol: string
  displaySymbol: string
  amount: string
  interestAmount?: string
  vaultState: LoanVaultState
}

export function LoansTab (props: {vault: LoanVault}): JSX.Element {
  const { vault } = props

  return (
    <ThemedView
      style={tailwind('p-4')}
    >
      {vault.state === LoanVaultState.ACTIVE && vault.loanValue === '0' &&
        (
          <EmptyLoan />
        )}
      {vault.state === LoanVaultState.IN_LIQUIDATION
        ? (
          vault.batches.map(batch => (
            <LoanCard
              key={batch.loan.id}
              symbol={batch.loan.id}
              displaySymbol={batch.loan.displaySymbol}
              amount={batch.loan.amount}
              vaultState={LoanVaultState.IN_LIQUIDATION}
            />
          ))
        )
        : (
          vault.loanAmounts.map(loan => (
            <LoanCard
              key={loan.id}
              symbol={loan.symbol}
              displaySymbol={loan.displaySymbol}
              amount={loan.amount}
              interestAmount={vault.interestAmounts.find(interest => interest.symbol === loan.symbol)?.amount}
              vaultState={vault.state}
            />
          ))
        )}

    </ThemedView>
  )
}

function LoanCard (props: LoanCardProps): JSX.Element {
  return (
    <ThemedView
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-gray-800 border-gray-700')}
      style={tailwind('p-4 mb-2 border rounded')}
    >
      <View style={tailwind('flex flex-row items-center')}>
        <SymbolIcon symbol={props.symbol} styleProps={{ width: 16, height: 16 }} />
        <ThemedText
          light={tailwind({ 'text-gray-300': props.vaultState === LoanVaultState.IN_LIQUIDATION, 'text-black': props.vaultState !== LoanVaultState.IN_LIQUIDATION })}
          dark={tailwind({ 'text-gray-700': props.vaultState === LoanVaultState.IN_LIQUIDATION, 'text-white': props.vaultState !== LoanVaultState.IN_LIQUIDATION })}
          style={tailwind('font-medium ml-2')}
        >
          {props.displaySymbol}
        </ThemedText>
      </View>
      <View style={tailwind('mt-3')}>
        <VaultSectionTextRow
          value={new BigNumber(props.amount).toFixed(8)}
          lhs={translate('components/VaultDetailsLoansTab', 'Outstanding balance')}
          testID='text_outstanding_balance'
          suffixType='text'
          suffix={` ${props.displaySymbol}`}
          style={tailwind('text-sm font-medium')}
          rhsThemedProps={{
            light: tailwind({ 'text-gray-300': props.vaultState === LoanVaultState.IN_LIQUIDATION, 'text-black': props.vaultState !== LoanVaultState.IN_LIQUIDATION }),
            dark: tailwind({ 'text-gray-700': props.vaultState === LoanVaultState.IN_LIQUIDATION, 'text-white': props.vaultState !== LoanVaultState.IN_LIQUIDATION })
          }}
        />
        {props.vaultState !== LoanVaultState.IN_LIQUIDATION &&
          (
            <VaultSectionTextRow
              value={new BigNumber(props.interestAmount ?? 0).toFixed(8)}
              lhs={translate('components/VaultDetailsLoansTab', 'Interest amount')}
              testID='text_interest_amount'
              suffixType='text'
              suffix={` ${props.displaySymbol}`}
            />
          )}
      </View>
      <ActionButtons hide />
    </ThemedView>
  )
}

// TODO: show button when payback is ready
function ActionButtons (props: {hide: boolean}): JSX.Element {
  if (props.hide) {
    return <></>
  }

  return (
    <View
      style={tailwind('mt-4 -mb-2 flex flex-row justify-between')}
    >
      <View style={tailwind('flex flex-row flex-wrap flex-1')}>
        <IconButton
          iconLabel={translate('components/VaultDetailsLoansTab', 'PAYBACK LOAN')}
          style={tailwind('mr-2 mb-2 p-2')}
          onPress={() => { /* TODO: handle repay loan on press */ }}
        />
        <IconButton
          iconLabel={translate('components/VaultDetailsLoansTab', 'BORROW MORE')}
          style={tailwind('mr-2 mb-2 p-2')}
          onPress={() => { /* TODO: handle borrow more on press */ }}
        />
      </View>
      <TouchableOpacity
        style={tailwind('flex justify-end mb-4')}
        onPress={() => { /* TODO: handle ... on press */ }}
      >
        <ThemedIcon
          iconType='MaterialIcons'
          name='more-horiz'
          size={16}
          light={tailwind('text-primary-500')}
          dark={tailwind('text-darkprimary-500')}
        />
      </TouchableOpacity>

    </View>
  )
}
