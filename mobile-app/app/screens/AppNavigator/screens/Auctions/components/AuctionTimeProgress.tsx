import { View } from '@components'
import { ThemedText } from '@components/themed'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { getColor, tailwind } from '@tailwind'
import { translate } from '@translations'
import React from 'react'
import { useAuctionTime } from '../hooks/AuctionTimeLeft'
import * as Progress from 'react-native-progress'
import BigNumber from 'bignumber.js'

interface AuctionTimeProgressProps {
  liquidationHeight: number
  blockCount: number
  label: string
}

export function AuctionTimeProgress (props: AuctionTimeProgressProps): JSX.Element {
  const { isLight } = useThemeContext()
  const { timeRemaining, blocksRemaining, blocksPerAuction } = useAuctionTime(props.liquidationHeight, props.blockCount)
  const normalizedBlocks = new BigNumber(blocksPerAuction).minus(blocksRemaining).dividedBy(blocksPerAuction).toNumber()

  return (
    <>
      <View style={tailwind('flex-row w-full items-center justify-between mb-2')}>
        <View style={tailwind('flex flex-row')}>
          <ThemedText
            light={tailwind('text-gray-500')}
            dark={tailwind('text-gray-400')}
            style={tailwind('text-xs')}
          >
            {translate('components/AuctionTimeProgress', props.label)}
          </ThemedText>
        </View>
        <View style={tailwind('flex flex-row')}>
          <ThemedText
            light={tailwind('text-gray-900')}
            dark={tailwind('text-gray-50')}
            style={tailwind('text-sm')}
          >
            {timeRemaining !== '' && translate('components/AuctionTimeProgress', '~{{time}} left', { time: timeRemaining })} ({translate('components/AuctionTimeProgress', '{{block}} blks', { block: blocksRemaining })})
          </ThemedText>
        </View>
      </View>
      <Progress.Bar
        progress={normalizedBlocks}
        width={null}
        borderColor={getColor(isLight ? 'gray-300' : 'gray-600')}
        color={getColor(isLight ? 'blue-500' : 'blue-500')}
        unfilledColor='gray-100'
        borderRadius={8}
        height={8}
      />
    </>
  )
}
