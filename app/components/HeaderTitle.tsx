import React from 'react'
import { Platform, View } from 'react-native'
import { useSelector } from 'react-redux'
import { useNetworkContext } from '../contexts/NetworkContext'
import { RootState } from '../store'
import { tailwind } from '../tailwind'
import { Text } from './Text'

export function ConnectionStatus (): JSX.Element {
  const { network } = useNetworkContext()
  const connected = useSelector((state: RootState) => state.block.connected)
  return (
    <View style={tailwind('flex-row items-center')}>
      <View
        testID='header_status_indicator'
        style={tailwind(`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} mr-1.5`)}
      />
      <View style={tailwind('h-full')}>
        <Text testID='header_active_network' style={tailwind('text-xs opacity-60 font-semibold leading-4')}>
          {network}
        </Text>
      </View>
    </View>
  )
}

export function HeaderTitle ({ text, testID }: { text: string, testID?: string }): JSX.Element {
  return (
    <View style={tailwind(`flex-col ${Platform.OS === 'ios' ? 'items-center' : ''}`)}>
      <Text testID={testID} style={tailwind('font-semibold leading-5')}>
        {text}
      </Text>
      <ConnectionStatus />
    </View>
  )
}
