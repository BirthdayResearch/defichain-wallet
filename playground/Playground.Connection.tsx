import React from 'react'
import { Text, View } from 'react-native'
import { useSelector } from 'react-redux'
import tailwind from 'tailwind-rn'
import { RootState } from '../store'
import { usePlaygroundRpcClient } from '../hooks/usePlaygroundRpcClient'

export function PlaygroundConnection (): JSX.Element {
  const playgroundEnvironment = useSelector<RootState>(state => state.network.playground?.environment)

  const rpcClient = usePlaygroundRpcClient()

  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      /* eslint-disable @typescript-eslint/no-floating-promises */
      rpcClient.blockchain.getBlockCount().then(count => {
        setCount(count)
      })
    }, 2900)
    return () => clearInterval(intervalId)
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
          Playground: {playgroundEnvironment ?? 'Not Connected'}
        </Text>

        <Text style={tailwind('text-xs font-medium text-gray-900')}>
          Block Count: {count === 0 ? '...' : count}
        </Text>
      </View>
    </View>
  )
}

function PlaygroundStatusBadge (): JSX.Element {
  const playground = useSelector<RootState>(state => state.network.playground)
  if (playground !== undefined) {
    return <View style={tailwind('h-3 w-3 rounded-full bg-green-500')} />
  }
  return <View style={tailwind('h-3 w-3 rounded-full bg-red-500')} />
}
