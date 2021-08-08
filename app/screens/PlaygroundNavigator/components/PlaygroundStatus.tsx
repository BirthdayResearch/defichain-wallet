import React from 'react'
import { View } from 'react-native'
import { tailwind } from '../../../tailwind'

export interface PlaygroundStatusProps {
  loading?: boolean
  online?: boolean
  offline?: boolean
  error?: boolean
}

export function PlaygroundStatus (props: PlaygroundStatusProps): JSX.Element {
  if (props.online !== undefined && props.online) {
    return <View testID='playground_status_indicator' style={tailwind('h-3 w-3 rounded-full bg-green-500')} />
  }
  if (props.offline !== undefined && props.offline) {
    return <View testID='playground_status_indicator' style={tailwind('h-3 w-3 rounded-full bg-red-500')} />
  }
  if (props.loading !== undefined && props.loading) {
    return <View testID='playground_status_indicator' style={tailwind('h-3 w-3 rounded-full bg-blue-500')} />
  }
  if (props.error !== undefined && props.error) {
    return <View testID='playground_status_indicator' style={tailwind('h-3 w-3 rounded-full bg-yellow-500')} />
  }
  return <View testID='playground_status_indicator' style={tailwind('h-3 w-3 rounded-full bg-gray-500')} />
}
