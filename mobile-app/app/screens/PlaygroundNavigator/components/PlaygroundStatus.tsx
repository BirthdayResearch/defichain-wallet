
import { View } from 'react-native'
import { tailwind } from '@tailwind'

export enum PlaygroundConnectionStatus {
  loading,
  online,
  offline,
  error
}

export interface PlaygroundStatusProps {
  loading?: boolean
  online?: boolean
  offline?: boolean
  error?: boolean
}

export function PlaygroundStatus (props: PlaygroundStatusProps): JSX.Element {
  if (props.online !== undefined && props.online) {
    return (
      <View
        style={tailwind('h-3 w-3 rounded-full bg-green-500')}
        testID='playground_status_indicator'
      />
    )
  }
  if (props.offline !== undefined && props.offline) {
    return (
      <View
        style={tailwind('h-3 w-3 rounded-full bg-red-500')}
        testID='playground_status_indicator'
      />
    )
  }
  if (props.loading !== undefined && props.loading) {
    return (
      <View
        style={tailwind('h-3 w-3 rounded-full bg-blue-500')}
        testID='playground_status_indicator'
      />
    )
  }
  if (props.error !== undefined && props.error) {
    return (
      <View
        style={tailwind('h-3 w-3 rounded-full bg-yellow-500')}
        testID='playground_status_indicator'
      />
    )
  }
  return (
    <View
      style={tailwind('h-3 w-3 rounded-full bg-gray-500')}
      testID='playground_status_indicator'
    />
  )
}
