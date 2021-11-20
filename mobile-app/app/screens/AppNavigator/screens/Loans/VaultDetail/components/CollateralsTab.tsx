import React from 'react'
import BigNumber from 'bignumber.js'
import { ThemedText, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { View } from '@components'
import { SymbolIcon } from '@components/SymbolIcon'
import { translate } from '@translations'
import NumberFormat from 'react-number-format'
import { LoanVault } from '@store/loans'
import { LoanVaultState } from '@defichain/whale-api-client/dist/api/loan'
import { EmptyCollateral } from './EmptyCollateral'

interface CollateralCardProps {
  symbol: string
  displaySymbol: string
  amount?: BigNumber
  vaultShare?: BigNumber
  vaultState: LoanVaultState
}

export function CollateralsTab ({ vault }: {vault: LoanVault}): JSX.Element {
  if (vault.state === LoanVaultState.ACTIVE && vault.collateralValue === '0') {
    return (
      <EmptyCollateral vaultId={vault.vaultId} />
    )
  }

  return (
    <View style={tailwind('p-4')}>
      {vault.state === LoanVaultState.IN_LIQUIDATION
        ? (
          vault.batches.map(batch =>
            batch.collaterals.map(collateral => (
              <CollateralCard
                key={collateral.id}
                symbol={collateral.symbol}
                displaySymbol={collateral.displaySymbol}
                vaultState={LoanVaultState.IN_LIQUIDATION}
              />
            ))
          )
        )
        : (
          vault.collateralAmounts.map(collateral => (
            <CollateralCard
              key={collateral.id}
              symbol={collateral.symbol}
              displaySymbol={collateral.displaySymbol}
              amount={new BigNumber(collateral.amount)}
              vaultShare={BigNumber.min(new BigNumber(collateral.amount).multipliedBy(collateral.activePrice?.active?.amount ?? 0).div(vault.collateralValue ?? 1), 1)}
              vaultState={vault.state}
            />
          ))
        )}
    </View>
  )
}

function CollateralCard (props: CollateralCardProps): JSX.Element {
  return (
    <ThemedView
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-gray-800 border-gray-700')}
      style={tailwind('p-4 mb-2 border rounded')}
    >
      <View style={tailwind('flex flex-row mb-3 justify-between items-center')}>
        <View style={tailwind('flex flex-row items-center')}>
          <SymbolIcon symbol={props.symbol} styleProps={{ width: 16, height: 16 }} />
          <ThemedText style={tailwind('ml-2 font-medium')}>{props.displaySymbol}</ThemedText>
        </View>
        <NumberFormat
          value={props.vaultShare?.multipliedBy(100).toFixed(2)}
          thousandSeparator
          decimalScale={2}
          displayType='text'
          suffix='%'
          renderText={(val: string) => (
            <ThemedText
              dark={tailwind('text-gray-50')}
              light={tailwind('text-gray-900')}
              style={tailwind('font-medium')}
            >
              {val}
            </ThemedText>
          )}
        />
      </View>

      <View style={tailwind('flex flex-row')}>
        <View style={tailwind('w-8/12')}>
          <CardLabel text='Collateral amount' />
          <View>
            <NumberFormat
              value={props.amount?.toFixed(8)}
              thousandSeparator
              decimalScale={8}
              displayType='text'
              suffix={` ${props.displaySymbol}`}
              renderText={(val: string) => (
                <ThemedText
                  dark={tailwind('text-gray-50')}
                  light={tailwind('text-gray-900')}
                  style={tailwind('text-sm')}
                >
                  {val}
                </ThemedText>
              )}
            />
          </View>
        </View>
      </View>
    </ThemedView>
  )
}

function CardLabel (props: {text: string}): JSX.Element {
  return (
    <ThemedText
      light={tailwind('text-gray-500')}
      dark={tailwind('text-gray-400')}
      style={tailwind('text-xs mb-1')}
    >
      {translate('components/VaultDetailsCollateralsTab', props.text)}
    </ThemedText>
  )
}
