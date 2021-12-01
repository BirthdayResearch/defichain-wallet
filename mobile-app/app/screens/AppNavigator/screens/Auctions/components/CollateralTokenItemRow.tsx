import React from 'react'
import { ThemedText, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { View } from '@components'
import { getNativeIcon } from '@components/icons/assets'
import { LoanVaultTokenAmount } from '@defichain/whale-api-client/dist/api/loan'
import NumberFormat from 'react-number-format'
import BigNumber from 'bignumber.js'

export function CollateralTokenItemRow ({ token }: { token: LoanVaultTokenAmount }): JSX.Element {
  const Icon = getNativeIcon(token.displaySymbol)
  const testID = `collateral_row_${token.id}`
  const activePrice = new BigNumber(token.activePrice?.active?.amount ?? 0)
  const collateralPrice = new BigNumber(activePrice).multipliedBy(token.amount)

  return (
    <ThemedView
      dark={tailwind('bg-gray-800 border-b border-gray-700')}
      light={tailwind('bg-white border-b border-gray-100')}
      style={tailwind('py-4 pl-4 pr-2 flex-row justify-between items-center')}
      testID={testID}
    >
      <View style={tailwind('flex-row items-center flex-grow')}>
        <Icon testID={`${testID}_icon`} />
        <View style={tailwind('mx-3 flex-auto')}>
          <ThemedText
            dark={tailwind('text-gray-50')}
            light={tailwind('text-gray-900')}
            style={tailwind('font-medium')}
            testID={`${testID}_symbol`}
          >
            {token.displaySymbol}
          </ThemedText>
          <ThemedText
            ellipsizeMode='tail'
            light={tailwind('text-gray-500')}
            dark={tailwind('text-gray-400')}
            numberOfLines={1}
            style={tailwind('text-sm font-medium text-gray-600')}
            testID={`${testID}_name`}
          >
            {token.name}
          </ThemedText>
        </View>
        <View style={tailwind('flex-row items-center')}>
          <View style={tailwind('items-end')}>
            <NumberFormat
              decimalScale={8}
              suffix={` ${token.displaySymbol}`}
              displayType='text'
              renderText={(value) =>
                <ThemedText
                  dark={tailwind('text-gray-50')}
                  light={tailwind('text-gray-900')}
                  style={tailwind('flex-wrap')}
                  testID={`${testID}_amount`}
                >
                  {value}
                </ThemedText>}
              thousandSeparator
              value={new BigNumber(token.amount).toFixed(8)}
            />
            <NumberFormat
              decimalScale={8}
              prefix='≈ '
              suffix=' USD'
              displayType='text'
              renderText={(value) =>
                <ThemedText
                  light={tailwind('text-gray-500')}
                  dark={tailwind('text-gray-400')}
                  style={tailwind('text-xs flex-wrap')}
                  testID={`${testID}_amount`}
                >
                  {value}
                </ThemedText>}
              thousandSeparator
              value={new BigNumber(collateralPrice).toFixed(2)}
            />
          </View>
        </View>
      </View>
    </ThemedView>
  )
}
