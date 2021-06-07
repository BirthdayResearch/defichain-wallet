import React, { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { useSelector } from 'react-redux'
import tailwind from 'tailwind-rn'
import { RootState } from '../../store'
import { usePlaygroundApiClient } from '../../hooks/api/usePlaygroundClient'
import { PlaygroundStatus } from '../Playground.Status'

export function PlaygroundConnection (): JSX.Element {
  const apiClient = usePlaygroundApiClient()

  const environment = useSelector<RootState>(state => state.network.playground?.environment)
  const [count, setCount] = useState(0)
  const [refresh, setRefresh] = useState(100)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    function reloadBlockCount (): void {
      apiClient.playground.info().then(({ block }) => {
        setCount(block.count)
        setConnected(true)
        setRefresh(2999)
        intervalId = setTimeout(reloadBlockCount, refresh)
      }).catch(() => {
        setConnected(false)
        setRefresh(refresh * 2)
      })
    }

    let intervalId = setTimeout(reloadBlockCount, refresh)
    return () => clearTimeout(intervalId)
  }, [refresh])

  return (
    <View>
      <View style={tailwind('flex flex-row items-center')}>
        <Text style={tailwind('text-lg font-bold')}>Connection</Text>
        <View style={tailwind('flex flex-row items-center ml-2')}>
          <PlaygroundStatus online={connected} offline={!connected} />
          <Text style={tailwind('text-xs ml-2 text-gray-900')}>↻{(refresh / 1000).toFixed(0)}s</Text>
        </View>
      </View>

      <View style={tailwind('mt-1')}>
        <Text style={tailwind('text-xs font-medium text-gray-900')}>
          Playground: {environment}
        </Text>

        <Text style={tailwind('text-xs font-medium text-gray-900')}>
          Block Count: {count === 0 ? '...' : count}
        </Text>
      </View>
    </View>
  )
}
