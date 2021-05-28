import React from 'react'
import { Text, View } from 'react-native'
import { useSelector } from 'react-redux'
import tailwind from 'tailwind-rn'
import { RootState } from '../store'

export function PlaygroundConnection (): JSX.Element {
  const blockCount = useSelector<RootState, number>(state => state.block.count ?? 0)
  const playgroundEnvironment = useSelector<RootState>(state => state.network.playground?.environment)

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
          Block Count: {blockCount === 0 ? '...' : blockCount}
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
