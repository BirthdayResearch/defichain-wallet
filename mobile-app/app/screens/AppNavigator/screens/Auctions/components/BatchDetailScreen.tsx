import React from 'react'
import { ThemedText, ThemedView, ThemedIcon } from '@components/themed'
import { tailwind } from '@tailwind'
import { View } from '@components'
import { translate } from '@translations'
import { getNativeIcon } from '@components/icons/assets'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { AuctionTimeProgress } from './AuctionTimeProgress'
import { StackScreenProps } from '@react-navigation/stack'
import { AuctionsParamList } from '../AuctionNavigator'
import { CollateralTokenIconGroup } from './CollateralTokenIconGroup'

type BatchDetailScreenProps = StackScreenProps<AuctionsParamList, 'BatchDetailScreen'>

export function BatchDetailScreen (props: BatchDetailScreenProps): JSX.Element {
  const { batch } = props.route.params

  const LoanIcon = getNativeIcon(batch.loan.displaySymbol)
  const blockCount = useSelector((state: RootState) => state.block.count) ?? 0

  return (
    <ThemedView
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-gray-800 border-gray-700')}
      style={tailwind('rounded mb-2 border p-4')}
      testID='testID'
    >
      <View style={tailwind('flex-row w-full items-center justify-between mb-4')}>
        <View style={tailwind('flex flex-row items-center')}>
          <ThemedView
            light={tailwind('bg-gray-100')}
            dark={tailwind('bg-gray-700')}
            style={tailwind('w-8 h-8 rounded-full items-center justify-center')}
          >
            <LoanIcon height={32} width={32} />
          </ThemedView>
          <View style={tailwind('flex flex-row ml-2')}>
            <View style={tailwind('flex')}>
              <ThemedText style={tailwind('font-semibold text-sm')}>
                {batch.loan.displaySymbol}
              </ThemedText>
              <View style={tailwind('flex flex-row items-center')}>
                <ThemedText
                  light={tailwind('text-gray-500')}
                  dark={tailwind('text-gray-400')}
                  style={tailwind('text-xs')}
                >
                  {translate('components/BatchDetailScreen', 'Batch #{{index}}', { index: 1 })}
                </ThemedText>
                <ThemedIcon
                  dark={tailwind('text-darkprimary-500')}
                  iconType='MaterialIcons'
                  light={tailwind('text-primary-500')}
                  name='open-in-new'
                  style={tailwind('ml-1')}
                  size={12}
                />
              </View>
            </View>
          </View>
        </View>
        <View style={tailwind('flex flex-row')}>
          <CollateralTokenIconGroup
            maxIconToDisplay={3}
            title={translate('components/BatchDetailScreen', 'Collaterals')}
            symbols={batch.collaterals.map(collateral => collateral.displaySymbol)}
          />
        </View>
      </View>

      <AuctionTimeProgress
        liquidationHeight={10}
        blockCount={blockCount}
        label='Auction time remaining'
      />

    </ThemedView>
  )
}
