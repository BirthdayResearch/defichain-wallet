import { View } from '@components'
import { memo } from 'react'
import { ThemedText } from '@components/themed'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { getColor, tailwind } from '@tailwind'
import { translate } from '@translations'

import { useAuctionTime } from '../hooks/AuctionTimeLeft'
import * as Progress from 'react-native-progress'
import BigNumber from 'bignumber.js'
import { StyleProp, TextStyle } from 'react-native'

interface AuctionTimeProgressProps {
  liquidationHeight: number
  blockCount: number
  label: string
  auctionTextStyle?: StyleProp<TextStyle>
}

export const AuctionTimeProgress = memo((props: AuctionTimeProgressProps): JSX.Element => {
  const { isLight } = useThemeContext()
  const { timeRemaining, blocksRemaining, blocksPerAuction } = useAuctionTime(props.liquidationHeight, props.blockCount)
  const normalizedBlocks = new BigNumber(blocksRemaining).dividedBy(blocksPerAuction).toNumber()

  return (
    <>
      <View style={tailwind('flex-row w-full justify-between mb-2')}>
        <View style={tailwind('w-6/12')}>
          <ThemedText
            light={tailwind('text-gray-500')}
            dark={tailwind('text-gray-400')}
            style={tailwind('text-xs')}
          >
            {translate('components/AuctionTimeProgress', props.label)}
          </ThemedText>
        </View>
        <View style={tailwind('flex flex-row flex-1 justify-end flex-wrap')}>
          <ThemedText
            light={tailwind('text-gray-900')}
            dark={tailwind('text-gray-50')}
            style={[tailwind('text-sm text-right'), props.auctionTextStyle]}
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
})
