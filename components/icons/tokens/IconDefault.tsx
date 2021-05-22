import * as React from 'react'
import Svg, { Circle, SvgProps, Text } from 'react-native-svg'

export function IconDefault (symbol: string): (props: SvgProps) => JSX.Element {
  // TODO(@defich/wallet): generate a default icon with the symbol as the art

  return (props: SvgProps): JSX.Element => {
    return (
      <Svg width={32} height={32} {...props}>
        <Circle cx={16} cy={16} r={16} fill='#cccccc' />
        <Text x='0' y='16' fontWeight='600' fontSize='12' fill='#000000'>{symbol}</Text>
      </Svg>
    )
  }
}
