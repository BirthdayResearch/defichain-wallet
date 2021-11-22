import React from 'react'
import BigNumber from 'bignumber.js'
import * as Progress from 'react-native-progress'
import { ThemedText, ThemedView } from '../../../../../components/themed'
import { getColor, tailwind } from '@tailwind'
import { View } from '@components'
import { translate } from '@translations'
import { TokenIconGroup } from '@components/TokenIconGroup'
import { IconButton } from '@components/IconButton'
import { LoanVaultLiquidationBatch } from '@defichain/whale-api-client/dist/api/loan'
import { getNativeIcon } from '@components/icons/assets'
import NumberFormat from 'react-number-format'
import { useThemeContext } from '@shared-contexts/ThemeProvider'

export interface BatchCardProps {
  vaultId: string
  batch: LoanVaultLiquidationBatch
  testID?: string
}

export interface Collateral {
  id: string
  vaultProportion: BigNumber
}

export interface LoanToken {
  tokenId: string
}

export function BatchCard (props: BatchCardProps): JSX.Element {
  const { batch } = props
  const { isLight } = useThemeContext()
  const LoanIcon = getNativeIcon(batch.loan.displaySymbol)

  return (
    <ThemedView
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-gray-800 border-gray-700')}
      style={tailwind('rounded mb-2 border p-4')}
    >
      <View style={tailwind('flex-row w-full items-center justify-between mb-4')}>
        <View style={tailwind('flex flex-row items-center')}>
          <ThemedView
            light={tailwind('bg-gray-100')}
            dark={tailwind('bg-gray-700')}
            style={tailwind('w-4 h-4 rounded-full items-center justify-center mr-2')}
          >
            <LoanIcon height={17} width={17} />
          </ThemedView>
          <View style={tailwind('flex flex-row')}>
            <ThemedText style={tailwind('font-semibold flex-shrink')}>
              {batch.loan.displaySymbol}
            </ThemedText>
          </View>
        </View>
        <View style={tailwind('flex flex-row')}>
          <ThemedText>
            <NumberFormat
              displayType='text'
              prefix='$'
              renderText={(value: string) => (
                <ThemedText
                  light={tailwind('text-gray-900')}
                  dark={tailwind('text-gray-50')}
                  style={tailwind('font-semibold')}
                >
                  {value}
                </ThemedText>
                )}
              thousandSeparator
              value={batch.loan.amount}
            />
          </ThemedText>
        </View>
      </View>

      <View style={tailwind('flex-row w-full items-center justify-between mb-2')}>
        <View style={tailwind('flex flex-row')}>
          <ThemedText
            light={tailwind('text-gray-500')}
            dark={tailwind('text-gray-400')}
            style={tailwind('text-xs')}
          >
            {translate('components/BatchCard', 'Latest bid')}
          </ThemedText>
        </View>
        <View style={tailwind('flex flex-row')}>
          <ThemedText>
            <NumberFormat
              suffix={` ${batch.loan.displaySymbol}`}
              displayType='text'
              renderText={(value: string) => (
                <ThemedText
                  light={tailwind('text-gray-900')}
                  dark={tailwind('text-gray-50')}
                  style={tailwind('text-sm')}
                >
                  {value}
                </ThemedText>
                )}
              thousandSeparator
              value={batch.loan.amount}
            />
          </ThemedText>
        </View>
      </View>

      <View style={tailwind('flex-row w-full items-center justify-between mb-2')}>
        <View style={tailwind('flex flex-row')}>
          <ThemedText
            light={tailwind('text-gray-500')}
            dark={tailwind('text-gray-400')}
            style={tailwind('text-xs')}
          >
            {translate('components/BatchCard', 'Token to win')}
          </ThemedText>
        </View>
        <View style={tailwind('flex flex-row')}>
          <TokenIconGroup symbols={batch.collaterals.map(collateral => collateral.displaySymbol)} maxIconToDisplay={3} />
        </View>
      </View>

      <View style={tailwind('flex-row w-full items-center justify-between mb-2')}>
        <View style={tailwind('flex flex-row')}>
          <ThemedText
            light={tailwind('text-gray-500')}
            dark={tailwind('text-gray-400')}
            style={tailwind('text-xs')}
          >
            {translate('components/BatchCard', 'Auction time left')}
          </ThemedText>
        </View>
        <View style={tailwind('flex flex-row')}>
          <ThemedText
            light={tailwind('text-gray-900')}
            dark={tailwind('text-gray-50')}
            style={tailwind('text-sm')}
          >
            5h 42m (712 blks)
          </ThemedText>
        </View>
      </View>
      <Progress.Bar
        progress={0.8}
        width={null}
        borderColor={getColor(isLight ? 'gray-300' : 'gray-600')}
        color={getColor(isLight ? 'blue-500' : 'blue-500')}
        unfilledColor='gray-100'
        borderRadius={8}
        height={8}
      />

      <ThemedView
        light={tailwind('border-gray-200')}
        dark={tailwind('border-gray-700')}
        style={tailwind('flex flex-row mt-4 flex-wrap -mb-2')}
      >
        <IconButton
          iconLabel={translate('components/BatchCard', 'PLACE BID')}
          iconSize={16}
          style={tailwind('mr-2 mb-2')}
          onPress={() => {}}
        />
        <IconButton
          iconLabel={translate('components/BatchCard', 'VIEW REWARDS')}
          iconSize={16}
          style={tailwind('mr-2 mb-2')}
          onPress={() => {}}
        />
      </ThemedView>
    </ThemedView>
  )
}
