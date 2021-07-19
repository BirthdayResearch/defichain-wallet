import React from 'react'
import { View } from 'react-native'
import { tailwind } from '../../../tailwind'

export function PlaygroundStatus (props: {
  loading?: boolean
  online?: boolean
  offline?: boolean
  error?: boolean
}): JSX.Element {
  if (props.online !== undefined && props.online) {
    return <View style={tailwind('h-3 w-3 rounded-full bg-green-500')} />
  }
  if (props.offline !== undefined && props.offline) {
    return <View style={tailwind('h-3 w-3 rounded-full bg-red-500')} />
  }
  if (props.loading !== undefined && props.loading) {
    return <View style={tailwind('h-3 w-3 rounded-full bg-blue-500')} />
  }
  if (props.error !== undefined && props.error) {
    return <View style={tailwind('h-3 w-3 rounded-full bg-yellow-500')} />
  }
  return <View style={tailwind('h-3 w-3 rounded-full bg-gray-500')} />
}
