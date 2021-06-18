import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import tailwind from 'tailwind-rn'
import { Text, View } from '../../components'
import { usePlaygroundApiClient } from '../../hooks/api/usePlaygroundClient'
import { RootState } from '../../store'
import { PlaygroundStatus } from '../Playground.Status'

export function PlaygroundConnection (): JSX.Element {
  const apiClient = usePlaygroundApiClient()

  const environment = useSelector<RootState>(state => state.network.playground?.environment)
  const [count, setCount] = useState(0)
  const [refresh, setRefresh] = useState(100)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    let isMounted = true

    function reloadBlockCount (): void {
      apiClient.playground.info().then(({ block }) => {
        if (isMounted) {
          setCount(block.count)
          setConnected(true)
          setRefresh(2999)
          intervalId = setTimeout(reloadBlockCount, refresh)
        }
      }).catch(() => {
        if (isMounted) {
          setConnected(false)
          setRefresh(refresh * 2)
        }
      })
    }

    let intervalId = setTimeout(reloadBlockCount, refresh)
    return () => {
      clearTimeout(intervalId)
      isMounted = false
    }
  }, [refresh])

  return (
    <View>
      <View style={tailwind('flex flex-row items-center')}>
        <Text style={tailwind('text-2xl font-bold')}>Connection</Text>
        <View style={tailwind('flex-row items-center ml-2')}>
          <PlaygroundStatus online={connected} offline={!connected} />
          <Text style={tailwind('ml-2 text-gray-900')}>↻{(refresh / 1000).toFixed(0)}s</Text>
        </View>
      </View>

      <View style={tailwind('mt-1')}>
        <Text style={tailwind('text-sm font-medium text-gray-900')}>
          Playground: {environment}
        </Text>

        <Text style={tailwind('mt-1 text-sm font-medium text-gray-900')}>
          Block Count: {count === 0 ? '...' : count}
        </Text>
      </View>
    </View>
  )
}
