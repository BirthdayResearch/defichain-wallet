import * as React from 'react'
import { View } from 'react-native'
import { tailwind } from '../tailwind'

export function RadioGroup ({ testID, items, component }: { testID: string, items: any[], component: (item: any, index: number) => JSX.Element }): JSX.Element {
  return (
    <View testID={testID} style={tailwind('flex-row items-center justify-between')}>
      {items.map((item: any, index: number) => component(item, index))}
    </View>
  )
}
