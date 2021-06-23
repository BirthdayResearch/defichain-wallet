import * as React from 'react'
import Svg, { Circle, G, Path, SvgProps } from 'react-native-svg'

export function IconETH (props: SvgProps): JSX.Element {
  return (
    <Svg width={32} height={32} viewBox='0 0 32 32' {...props}>
      <Circle cx={16} cy={16} r={16} fill='#627EEA' />
      <G fill='#FFF'>
        <Path fillOpacity={0.602} d='M16.498 4v8.87l7.497 3.35z' />
        <Path d='M16.498 4L9 16.22l7.498-3.35z' />
        <Path fillOpacity={0.602} d='M16.498 21.968v6.027L24 17.616z' />
        <Path d='M16.498 27.995v-6.028L9 17.616z' />
        <Path fillOpacity={0.2} d='M16.498 20.573l7.497-4.353-7.497-3.348z' />
        <Path fillOpacity={0.602} d='M9 16.22l7.498 4.353v-7.701z' />
      </G>
    </Svg>
  )
}
