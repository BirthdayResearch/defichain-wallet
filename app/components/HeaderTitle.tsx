import React, { useEffect } from 'react'
import { View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { Logging } from '../api'
import { useNetworkContext } from '../contexts/NetworkContext'
import { useWhaleApiClient } from '../contexts/WhaleContext'
import { isPlayground } from '../environment'
import { RootState } from '../store'
import { block } from '../store/block'
import { tailwind } from '../tailwind'
import { Text } from './Text'

export function ConnectionStatus (): JSX.Element {
  const { network } = useNetworkContext()
  const connected = useSelector((state: RootState) => state.block.connected)
  const isPolling = useSelector((state: RootState) => state.block.isPolling)
  const api = useWhaleApiClient()

  const dispatch = useDispatch()

  useEffect(() => {
    let interval: number

    function refresh (): void {
      dispatch(block.actions.setPolling(true))
      api.stats.get().then(({ count }) => {
        dispatch(block.actions.updateBlock({ count: count.blocks }))
        dispatch(block.actions.setConnected(true))
      }).catch((err) => {
        dispatch(block.actions.updateBlock({ count: 0 }))
        dispatch(block.actions.setConnected(false))
        Logging.error(err)
      })
    }

    if (!isPolling) {
      refresh()
      interval = setInterval(refresh, isPlayground(network) ? 3000 : 30000)
    }
    return () => {
      dispatch(block.actions.setPolling(false))
      if (interval !== undefined) {
        clearInterval(interval)
      }
    }
  }, [network])
  return (
    <View style={tailwind('flex-row items-center')}>
      <View
        testID='header_status_indicator'
        style={tailwind(`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} mr-2`)}
      />
      <Text testID='header_active_network' style={tailwind('text-xs text-gray-500')}>{network}</Text>
    </View>
  )
}

export function HeaderTitle ({ text, testID }: { text: string, testID?: string }): JSX.Element {
  return (
    <View style={tailwind('flex-col')}>
      <Text
        testID={testID}
        style={tailwind('font-semibold')}
      >
        {
          text
        }
      </Text>
      <ConnectionStatus />
    </View>
  )
}
