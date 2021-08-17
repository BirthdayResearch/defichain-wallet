import * as React from 'react'
import Svg, { Circle, Path, SvgProps } from 'react-native-svg'

export function dETH (props: SvgProps): JSX.Element {
  return (
    <Svg width={32} height={32} {...props}>
      <Circle cx={16} cy={16} r={16} fill='#E0E5FB' />
      <Path
        fill='#FFF'
        d='M23.5 17.616l-7.502 10.379v-6.027l7.502-4.352zm-7.502-4.744v7.701L8.5 16.22l7.498-3.348zm0-8.872l7.497 12.22-7.497-3.35V4z'
      />
      <Path
        fill='#627EEA'
        fillOpacity={0.8}
        d='M23.5 17.616l-7.502 10.379v-6.027l7.502-4.352zm-7.502-4.744v7.701L8.5 16.22l7.498-3.348zm0-8.872l7.497 12.22-7.497-3.35V4z'
      />
      <Path
        fill='#FFF'
        d='M8.5 17.616l7.498 4.351v6.028L8.5 17.616zM15.998 4v8.87L8.5 16.22 15.998 4z'
      />
      <Path
        fill='#627EEA'
        fillOpacity={0.6}
        d='M8.5 17.616l7.498 4.351v6.028L8.5 17.616zM15.998 4v8.87L8.5 16.22 15.998 4z'
      />
      <Path fill='#627EEA' d='M15.998 20.573l7.497-4.353-7.497-3.348z' />
    </Svg>
  )
}
