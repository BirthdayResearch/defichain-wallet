import React, { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { useSelector } from 'react-redux'
import tailwind from 'tailwind-rn'
import { RootState } from '../../store'
import { usePlaygroundRpcClient } from '../../hooks/api/usePlaygroundRpcClient'
import { PlaygroundStatus } from '../Playground.Status'

export function PlaygroundConnection (): JSX.Element {
  const rpcClient = usePlaygroundRpcClient()

  const environment = useSelector<RootState>(state => state.network.playground?.environment)
  const [count, setCount] = useState(0)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const intervalId = setInterval(() => {
      /* eslint-disable @typescript-eslint/no-floating-promises */
      rpcClient.blockchain.getBlockCount().then(count => {
        setConnected(true)
        setCount(count)
      }).catch(() => {
        setConnected(false)
      })
    }, 5999)
    return () => clearInterval(intervalId)
  }, [])

  return (
    <View>
      <View style={tailwind('flex-row flex items-center')}>
        <Text style={tailwind('text-lg font-bold')}>Connection</Text>
        <View style={tailwind('ml-2')}>
          <PlaygroundStatus online={connected} offline={!connected} />
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
