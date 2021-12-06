import { View } from '@components'
import { BottomSheetInfo } from '@components/BottomSheetInfo'
import { ThemedText, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import React from 'react'
import NumberFormat from 'react-number-format'
import { VaultHealthItem, VaultStatusTag } from './VaultStatusTag'

interface CollateralizationRatioRowProps {
  label: string
  value: string
  testId: string
  type: 'current' | 'next'
  vaultState: VaultHealthItem
}

export function CollateralizationRatioRow (props: CollateralizationRatioRowProps): JSX.Element {
  const alertInfo = {
    title: 'Collateralization ratio',
    message: 'The collateralization ratio represents the amount of collaterals deposited in a vault in relation to the loan amount, expressed in percentage.'
  }
  const nextAlertInfo = {
    title: 'Next collateralization',
    message: 'Next collateralization ratio represents the vault\'s collateralization ratio based on the prices of the collateral/loan token(s) in the next hour.'
  }
  return (
    <ThemedView
      dark={tailwind('bg-gray-800 border-gray-700')}
      light={tailwind('bg-white border-gray-200')}
      style={tailwind('p-4 flex-row items-start w-full border-b')}
    >
      <View style={tailwind('flex-row items-center w-6/12')}>
        <ThemedText
          style={tailwind('text-sm mr-1')}
          testID={`${props.testId}_label`}
        >
          {props.label}
        </ThemedText>
        <BottomSheetInfo
          alertInfo={props.type === 'next' ? nextAlertInfo : alertInfo}
          name={props.type === 'next' ? nextAlertInfo.title : alertInfo.title}
        />
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
              <VaultStatusTag status={props.vaultState.status} vaultStats={props.vaultState.vaultStats} />
            </View>
          )}
        />
      </View>
    </ThemedView>
  )
}
