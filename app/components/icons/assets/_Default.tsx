import * as React from 'react'
import randomColor from 'randomcolor'
import Svg, { Circle, SvgProps, Text } from 'react-native-svg'

export function _Default (symbol: string): (props: SvgProps) => JSX.Element {
  return (props: SvgProps): JSX.Element => {
    const bg = randomColor({ luminosity: 'bright', format: 'rgba', seed: symbol, alpha: 0.2 })
    const text = randomColor({ luminosity: 'dark', format: 'rgba', seed: symbol, alpha: 100 })
    const first = symbol?.substring(0, 1) ?? 'T'

    return (
      <Svg width={32} height={32} viewBox='0 0 32 32' {...props}>
        <Circle cx={16} cy={16} r={16} fill={bg} />
        <Text
          x='50%'
          y='50%'
          fill={text}
          textAnchor='middle'
          fontSize='24'
          fontWeight='bolder'
          alignmentBaseline='central'
        >
          {first}
        </Text>
      </Svg>
    )
  }
}
