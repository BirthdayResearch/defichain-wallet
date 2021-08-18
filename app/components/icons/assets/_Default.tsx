import randomColor from 'randomcolor'
import * as React from 'react'
import Svg, { Circle, SvgProps, Text } from 'react-native-svg'

export function _Default (symbol: string): (props: SvgProps) => JSX.Element {
  return (props: SvgProps): JSX.Element => {
    const color = randomColor({ luminosity: 'dark', seed: symbol })
    const startingLetter = symbol?.substring(0, 1) ?? 'T'
    return (
      <Svg width={32} height={32} viewBox='0 0 32 32' {...props}>
        <Circle cx={16} cy={16} r={16} fill={color} />
        <Text
          x='50%' y='50%' alignmentBaseline='central' textAnchor='middle' fontWeight='bolder'
          fontSize='24' fill='#ffffff'
        >
          {startingLetter}
        </Text>
      </Svg>
    )
  }
}
