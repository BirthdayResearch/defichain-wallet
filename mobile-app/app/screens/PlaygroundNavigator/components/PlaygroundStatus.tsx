/* eslint-disable react-native/no-raw-text */
import { tailwind } from '@tailwind'
import { ThemedIcon, ThemedTextV2 } from '@components/themed'
import { View } from 'react-native'

export enum PlaygroundConnectionStatus {
  loading,
  online,
  offline,
  error
}

export enum PlaygroundStatusType {
  primary= 'PRIMARY',
  secondary= 'SECONDARY'
}

export interface PlaygroundStatusProps {
  loading?: boolean
  online?: boolean
  offline?: boolean
  error?: boolean
  type: PlaygroundStatusType
}

export function PlaygroundStatus ({ online, error, loading, offline, type }: PlaygroundStatusProps): JSX.Element {
  if (online !== undefined && online) {
    return (
      <View style={tailwind('flex flex-row items-center')}>
        <ThemedTextV2
          dark={tailwind('text-mono-dark-v2-700', { 'text-green-v2': type === PlaygroundStatusType.secondary })}
          light={tailwind('text-mono-light-v2-700', { 'text-green-v2': type === PlaygroundStatusType.secondary })}
          style={tailwind('font-normal-v2',
            { 'text-sm mr-1.5 ': type === PlaygroundStatusType.primary },
            { 'text-xs': type === PlaygroundStatusType.secondary }
          )}
        >
          {type === PlaygroundStatusType.primary ? 'Online' : 'Connected'}
        </ThemedTextV2>
        {type === PlaygroundStatusType.primary &&
          <ThemedIcon
            light={tailwind('text-green-v2')}
            dark={tailwind('text-green-v2')}
            iconType='MaterialIcons'
            name='check-circle'
            size={18}
            testID='playground_status_indicator'
          />}
      </View>
    )
  }
  if (offline !== undefined && offline) {
    return (
      <View style={tailwind('flex flex-row items-center')}>
        <ThemedTextV2
          dark={tailwind('text-mono-dark-v2-700')}
          light={tailwind('text-mono-light-v2-700')}
          style={tailwind('font-normal-v2',
            { 'text-sm mr-1.5': type === PlaygroundStatusType.primary },
            { 'text-xs': type === PlaygroundStatusType.secondary }
          )}
        >
          {type === PlaygroundStatusType.primary ? 'Offline' : 'Disconnected'}
        </ThemedTextV2>
        {type === PlaygroundStatusType.primary &&
          <ThemedIcon
            light={tailwind('text-red-v2')}
            dark={tailwind('text-red-v2')}
            iconType='MaterialCommunityIcons'
            name='close-circle'
            size={18}
            testID='playground_status_indicator'
          />}
      </View>
    )
  }
  if (loading !== undefined && loading) {
    return (
      <View style={tailwind('flex flex-row items-center')}>
        <ThemedTextV2
          dark={tailwind('text-blue-500')}
          light={tailwind('text-blue-500')}
          style={tailwind('font-normal-v2',
            { 'text-sm mr-1.5': type === PlaygroundStatusType.primary },
            { 'text-xs': type === PlaygroundStatusType.secondary }
          )}
        >
          Connecting
        </ThemedTextV2>
        {type === PlaygroundStatusType.primary &&
          <ThemedIcon
            light={tailwind('text-blue-500')}
            dark={tailwind('text-blue-500')}
            iconType='MaterialIcons'
            name='check-circle'
            size={18}
            testID='playground_status_indicator'
          />}
      </View>

    )
  }
  if (error !== undefined && error) {
    return (
      <View style={tailwind('flex flex-row items-center')}>
        <ThemedTextV2
          dark={tailwind('text-mono-dark-v2-700')}
          light={tailwind('text-mono-light-v2-700')}
          style={tailwind('font-normal-v2',
            { 'text-sm mr-1.5': type === PlaygroundStatusType.primary },
            { 'text-xs': type === PlaygroundStatusType.secondary }
          )}
        >
          Partial outage
        </ThemedTextV2>
        {type === PlaygroundStatusType.primary &&
          <ThemedIcon
            light={tailwind('text-yellow-500')}
            dark={tailwind('text-yellow-500')}
            iconType='MaterialIcons'
            name='check-circle'
            size={18}
            testID='playground_status_indicator'
          />}
      </View>
    )
  }
  return (
    <ThemedIcon
      light={tailwind('text-mono-light-v2-700 opacity-30')}
      dark={tailwind('text-mono-light-v2-700 opacity-30')}
      iconType='MaterialIcons'
      name='check-circle'
      size={18}
      testID='playground_status_indicator'
    />
  )
}
