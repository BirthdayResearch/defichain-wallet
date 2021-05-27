import { Text, View } from 'react-native'
import tailwind from 'tailwind-rn'
import React, { useEffect } from 'react'
import { Playground } from '../hooks/defi/useDeFiPlayground'

export function PlaygroundConnection (): JSX.Element {
  const [blockCount, setBlockCount] = React.useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      if (Playground.rpcClient === undefined) {
        return
      }

      /* eslint-disable @typescript-eslint/no-floating-promises */
      Playground.rpcClient.blockchain.getBlockCount().then(value => {
        setBlockCount(value)
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <View>
      <View style={tailwind('flex-row flex items-center')}>
        <Text style={tailwind('font-bold')}>Connection</Text>
        <View style={tailwind('ml-2')}>
          <PlaygroundStatusBadge />
        </View>
      </View>

      <View style={tailwind('mt-1')}>
        <Text style={tailwind('text-xs font-medium text-gray-900')}>
          Playground: {Playground.provider ?? 'Not Connected'}
        </Text>

        <Text style={tailwind('text-xs font-medium text-gray-900')}>
          Block Count: {blockCount === 0 ? '...' : blockCount}
        </Text>
      </View>
    </View>
  )
}

function PlaygroundStatusBadge (): JSX.Element {
  if (Playground.rpcClient !== undefined) {
    return <View style={tailwind('h-3 w-3 rounded-full bg-green-500')} />
  }
  return <View style={tailwind('h-3 w-3 rounded-full bg-red-500')} />
}
