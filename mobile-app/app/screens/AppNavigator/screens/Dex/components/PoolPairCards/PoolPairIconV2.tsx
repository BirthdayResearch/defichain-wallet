import React from 'react'
import { StyleProp, View, ViewProps } from 'react-native'
import { tailwind } from '@tailwind'
import { getNativeIcon } from '@components/icons/assets'

export function PoolPairIconV2 (props: {
  symbolA: string
  symbolB: string
  customSize?: number
  iconBStyle?: StyleProp<ViewProps>
  testID?: string
}): JSX.Element {
  const IconA = getNativeIcon(props.symbolA)
  const IconB = getNativeIcon(props.symbolB)
  return (
    <View style={tailwind('flex-row')} testID={props.testID}>
      <IconA height={props.customSize ?? 40} width={props.customSize ?? 40} style={tailwind('relative z-10')} />
      <IconB height={props.customSize ?? 40} width={props.customSize ?? 40} style={[tailwind('-ml-4'), props.iconBStyle]} />
    </View>
  )
}
