import { Text, View } from 'react-native'
import tailwind from 'tailwind-rn'
import React from 'react'

export function PlaygroundConnection (): JSX.Element {
  return (
    <View>
      <Text style={tailwind('font-bold')}>Connection</Text>
    </View>
  )
}

// TODO(fuxingloh): Display Block Count
