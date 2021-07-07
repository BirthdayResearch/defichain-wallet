import * as React from 'react'
import Svg, { Circle, SvgProps, Text } from 'react-native-svg'

export function IconDefault (symbol: string): (props: SvgProps) => JSX.Element {
  return (props: SvgProps): JSX.Element => {
    return (
      <Svg width={32} height={32} viewBox='0 0 32 32' {...props}>
        <Circle cx={16} cy={16} r={16} fill='#444444' />
        <Text
          x='50%' y='50%' alignmentBaseline='middle' textAnchor='middle' fontWeight='bolder' fontSize='11'
          fill='#ffffff'
        >{symbol}
        </Text>
      </Svg>
    )
  }
}
