import React, { useEffect, useState } from "react";
import { Text, View } from 'react-native'
import { useSelector } from 'react-redux'
import tailwind from 'tailwind-rn'
import { RootState } from '../store'
import { usePlaygroundRpcClient } from '../hooks/api/usePlaygroundRpcClient'

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
      })
    }, 2950)
    return () => clearInterval(intervalId)
  }, [])

  return (
    <View>
      <View style={tailwind('flex-row flex items-center')}>
        <Text style={tailwind('font-bold')}>Connection</Text>
        <View style={tailwind('ml-2')}>
          <PlaygroundStatusBadge connected={connected} />
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

function PlaygroundStatusBadge (props: { connected: boolean }): JSX.Element {
  if (props.connected) {
    return <View style={tailwind('h-3 w-3 rounded-full bg-green-500')} />
  }
  return <View style={tailwind('h-3 w-3 rounded-full bg-red-500')} />
}
