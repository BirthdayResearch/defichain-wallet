import React from 'react'
import { Platform, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'
import { useNetworkContext } from '../contexts/NetworkContext'
import { RootState } from '../store'
import { tailwind } from '../tailwind'
import { ThemedIcon, ThemedText } from './themed'

type SubHeadingType = 'Status' | 'NetworkSelect' | 'NetworkDetails'

export function HeaderTitle ({
  text,
  subHeadingType = 'Status',
  testID,
  onPress
}: { text: string, subHeadingType?: SubHeadingType, testID?: string, onPress?: () => void }): JSX.Element {
  return (
    <TouchableOpacity
      disabled={subHeadingType === undefined || subHeadingType === 'Status'}
      onPress={onPress}
      style={tailwind(`flex-col ${Platform.OS === 'ios' ? 'items-center' : ''}`)}
    >
      <ThemedText
        dark={tailwind('text-white text-opacity-90')}
        light={tailwind('text-black')}
        style={tailwind('font-semibold leading-5')}
        testID={testID}
      >
        {text}
      </ThemedText>

      {subHeadingType === 'Status' && <ConnectionStatus />}
      {subHeadingType === 'NetworkSelect' && <HeaderNetworkSelect />}
    </TouchableOpacity>
  )
}

export function ConnectionStatus (): JSX.Element {
  const { network } = useNetworkContext()
  const connected = useSelector((state: RootState) => state.block.connected)
  return (
    <View style={tailwind('flex-row items-center')}>
      <View
        style={tailwind(`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} mr-1.5`)}
        testID='header_status_indicator'
      />
      <View style={tailwind('h-full')}>
        <ThemedText
          dark={tailwind('text-white text-opacity-70')}
          light={tailwind('text-gray-600')}
          style={tailwind('text-xs font-semibold leading-4')}
          testID='header_active_network'
        >
          {network}
        </ThemedText>
      </View>
    </View>
  )
}

function HeaderNetworkSelect (): JSX.Element {
  const { network } = useNetworkContext()

  return (
    <View style={tailwind('flex-row items-center')}>
      <ThemedIcon
        iconType='MaterialIcons'
        name='wifi-tethering'
        size={16}
        style={tailwind('mr-1.5')}
        dark={tailwind('text-white text-opacity-70')}
        light={tailwind('text-gray-600')}
      />

      <View style={tailwind('h-full')}>
        <ThemedText
          dark={tailwind('text-white text-opacity-70')}
          light={tailwind('text-gray-600')}
          style={tailwind('text-xs font-semibold leading-4')}
          testID='header_active_network'
        >
          {network}
        </ThemedText>
      </View>
    </View>
  )
}
