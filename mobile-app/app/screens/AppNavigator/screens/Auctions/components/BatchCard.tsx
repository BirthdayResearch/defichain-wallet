import React from 'react'
import BigNumber from 'bignumber.js'
import { ThemedText, ThemedView } from '../../../../../components/themed'
import { tailwind } from '@tailwind'
import { View } from '@components'
import { translate } from '@translations'
import { TokenIconGroup } from '@components/TokenIconGroup'
import { IconButton } from '@components/IconButton'
import { LoanVaultLiquidationBatch, LoanVaultState } from '@defichain/whale-api-client/dist/api/loan'
import { getNativeIcon } from '@components/icons/assets'
import NumberFormat from 'react-number-format'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { AuctionTimeProgress } from './AuctionTimeProgress'

export interface BatchCardProps {
  vaultId: string
  state: LoanVaultState
  liquidationHeight: number
  batch: LoanVaultLiquidationBatch
  testID?: string
}

export function BatchCard (props: BatchCardProps): JSX.Element {
  const { batch, state, liquidationHeight, testID } = props
  const LoanIcon = getNativeIcon(batch.loan.displaySymbol)
  const blockCount = useSelector((state: RootState) => state.block.count) ?? 0

  return (
    <ThemedView
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-gray-800 border-gray-700')}
      style={tailwind('rounded mb-2 border p-4')}
      testID={testID}
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
          {state === LoanVaultState.IN_LIQUIDATION && (
            <ThemedView
              light={tailwind('bg-blue-100')}
              dark={tailwind('bg-darkblue-100')}
              style={tailwind('ml-2')}
              testID={`active_indicator_${batch.index}`}
            >
              <ThemedText
                light={tailwind('text-blue-500')}
                dark={tailwind('text-darkblue-500')}
                style={tailwind('text-xs px-1 font-medium')}
              >
                {translate('components/BatchCard', 'ACTIVE BID')}
              </ThemedText>
            </ThemedView>
          )}
        </View>
        <View style={tailwind('flex flex-row')}>
          <ThemedText>
            <NumberFormat
              displayType='text'
              prefix='$'
              decimalScale={2}
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
              value={new BigNumber(batch.loan.amount).multipliedBy(batch.loan.activePrice?.active?.amount ?? 0).toFixed(2)}
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
          {batch.highestBid === undefined
            ? (
              <ThemedText
                light={tailwind('text-gray-900')}
                dark={tailwind('text-gray-50')}
                style={tailwind('text-sm')}
              >
                {translate('components/BatchCard', 'N/A')}
              </ThemedText>
            )
            : (
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
                value={new BigNumber(batch.highestBid.amount.amount).toFixed(8)}
              />
            )}
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
          <TokenIconGroup symbols={batch.collaterals.map(collateral => collateral.displaySymbol)} maxIconToDisplay={5} />
        </View>
      </View>

      <AuctionTimeProgress
        liquidationHeight={liquidationHeight}
        blockCount={blockCount}
        label='Auction time left'
      />
      <BatchCardButtons />
    </ThemedView>
  )
}

function BatchCardButtons (): JSX.Element {
  return (
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
  )
}
