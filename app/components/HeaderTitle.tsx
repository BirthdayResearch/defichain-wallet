import React from 'react'
import { Platform, View } from 'react-native'
import { useSelector } from 'react-redux'
import { useNetworkContext } from '../contexts/NetworkContext'
import { RootState } from '../store'
import { tailwind } from '../tailwind'
import { ThemedText } from './themed'

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
        <ThemedText
          testID='header_active_network'
          style={tailwind('text-xs font-semibold leading-4')}
          light={tailwind('text-gray-600')}
          dark={tailwind('text-white text-opacity-70')}
        >
          {network}
        </ThemedText>
      </View>
    </View>
  )
}

export function HeaderTitle ({ text, testID }: { text: string, testID?: string }): JSX.Element {
  return (
    <View style={tailwind(`flex-col ${Platform.OS === 'ios' ? 'items-center' : ''}`)}>
      <ThemedText
        testID={testID} style={tailwind('font-semibold leading-5')} light={tailwind('text-black')}
        dark={tailwind('text-white text-opacity-90')}
      >
        {text}
      </ThemedText>
      <ConnectionStatus />
    </View>
  )
}
