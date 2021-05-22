import * as React from 'react'
import Svg, { SvgProps, Circle, G, Path } from 'react-native-svg'

export function IconETH (props: SvgProps): JSX.Element {
  return (
    <Svg height={32} width={32} {...props}>
      <Circle cx={16} cy={16} fill='#627eea' r={16} />
      <G fill='#fff'>
        <Path d='M16.498 4v8.87l7.497 3.35z' fillOpacity={0.602} />
        <Path d='M16.498 4L9 16.22l7.498-3.35z' />
        <Path d='M16.498 21.968v6.027L24 17.616z' fillOpacity={0.602} />
        <Path d='M16.498 27.995v-6.028L9 17.616z' />
        <Path d='M16.498 20.573l7.497-4.353-7.497-3.348z' fillOpacity={0.2} />
        <Path d='M9 16.22l7.498 4.353v-7.701z' fillOpacity={0.602} />
      </G>
    </Svg>
  )
}
