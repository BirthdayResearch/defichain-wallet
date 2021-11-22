import React from 'react'
import BigNumber from 'bignumber.js'
import * as Progress from 'react-native-progress'
import { ThemedIcon, ThemedText, ThemedView } from '../../../../../components/themed'
import { getColor, tailwind } from '@tailwind'
import { View } from '@components'
import { translate } from '@translations'
import { IconButton } from '@components/IconButton'
import { TouchableOpacity } from 'react-native'
import { LoanVaultLiquidationBatch } from '@defichain/whale-api-client/dist/api/loan'
import NumberFormat from 'react-number-format'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { useSelector } from 'react-redux'
import { secondsToHm } from './BatchCard'
import { RootState } from '@store'

export interface BidCardProps {
  vaultId: string
  batch: LoanVaultLiquidationBatch
  liquidationHeight: number
}

export interface Collateral {
  id: string
  vaultProportion: BigNumber
}

export interface LoanToken {
  tokenId: string
}

export function BidCard (props: BidCardProps): JSX.Element {
  const { batch, vaultId, liquidationHeight } = props
  const { isLight } = useThemeContext()
  const blockCount = useSelector((state: RootState) => state.block.count)
  const blocksRemaining = liquidationHeight - blockCount
  const timeRemaining = (blocksRemaining > 0) ? secondsToHm(blocksRemaining * 30) : ''

  return (
    <ThemedView
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-gray-800 border-gray-700')}
      style={tailwind('rounded mb-2 border p-4')}
    >
      <View style={tailwind('flex-row w-full items-center justify-between mb-4')}>
        <View style={tailwind('flex flex-row')}>
          <NumberFormat
            displayType='text'
            suffix={` ${batch.loan.displaySymbol}`}
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
        </View>
      </View>

      <View style={tailwind('flex-row w-full items-center justify-between mb-2')}>
        <View style={tailwind('flex w-1/2 flex-row')}>
          <ThemedText
            light={tailwind('text-gray-500')}
            dark={tailwind('text-gray-400')}
            style={tailwind('text-xs')}
          >
            {translate('components/BidCard', 'Auction ID')}
          </ThemedText>
        </View>
        <View style={tailwind('flex w-1/2 flex-row')}>
          <ThemedText
            style={tailwind('flex-shrink mr-0.5')}
            numberOfLines={1}
            ellipsizeMode='middle'
          >
            {vaultId}
          </ThemedText>
          <TouchableOpacity onPress={() => {}}>
            <ThemedIcon
              dark={tailwind('text-darkprimary-500')}
              iconType='MaterialIcons'
              light={tailwind('text-primary-500')}
              name='open-in-new'
              size={18}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={tailwind('flex-row w-full items-center justify-between mb-2')}>
        <View style={tailwind('flex flex-row')}>
          <ThemedText
            light={tailwind('text-gray-500')}
            dark={tailwind('text-gray-400')}
            style={tailwind('text-xs')}
          >
            {translate('components/BidCard', 'Auction ends on')}
          </ThemedText>
        </View>
        <View style={tailwind('flex flex-row')}>
          <ThemedText
            light={tailwind('text-gray-900')}
            dark={tailwind('text-gray-50')}
            style={tailwind('text-sm')}
          >
            {timeRemaining} ({translate('components/BidCard', '{{block}} blks', { block: blocksRemaining })})
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
          iconLabel={translate('components/BidCard', 'BID HIGHER')}
          iconSize={16}
          style={tailwind('mr-2 mb-2')}
          onPress={() => {}}
        />
        <IconButton
          iconLabel={translate('components/BidCard', 'VIEW REWARDS')}
          iconSize={16}
          style={tailwind('mr-2 mb-2')}
          onPress={() => {}}
        />
      </ThemedView>
    </ThemedView>
  )
}
