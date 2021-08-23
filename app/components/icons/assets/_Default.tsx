import * as React from 'react'
import randomColor from 'randomcolor'
import { View, Text } from 'react-native'
import { tailwind } from '../../../tailwind'

interface _DefaultProps extends React.SVGProps<SVGSVGElement> {
  testID?: string
  style?: object
}

export function _Default (symbol: string): (props: _DefaultProps) => JSX.Element {
  return (props: _DefaultProps): JSX.Element => {
    const { style, testID } = props
    const height = '32px'
    const width = '32px'
    const bg = randomColor({ luminosity: 'bright', format: 'rgba', seed: symbol, alpha: 0.2 })
    const text = randomColor({ luminosity: 'dark', format: 'rgba', seed: symbol, alpha: 100 })
    const first = symbol?.substring(0, 1)

    return (
      <View style={{ height, width, ...style }} testID={testID}>
        <View style={{ backgroundColor: bg, ...tailwind('rounded-full w-full h-full') }}>
          <View style={tailwind('flex-row w-full h-full flex items-center')}>
            <Text style={{ color: text, ...tailwind('flex-1 w-1 text-center font-semibold') }}>{first}</Text>
          </View>
        </View>
      </View>
    )
  }
}
