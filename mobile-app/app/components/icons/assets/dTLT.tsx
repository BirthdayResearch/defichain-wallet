import * as React from 'react'
import Svg, { Path, SvgProps, Circle } from 'react-native-svg'

export function dTLT (props: SvgProps): JSX.Element {
  return (
    <Svg
      height={32}
      width={32}
      viewBox='0 0 32 32'
      {...props}
    >
      <Circle cx='16' cy='16' r='16' fill='#769F43' />
      <Path d='M9.06426 13.479V20H10.8234V13.479H13.2211V12H6.6665V13.479H9.06426Z' fill='white' />
      <Path d='M14.1436 12V20H19.8018V18.521H15.9027V12H14.1436Z' fill='white' />
      <Path d='M21.5271 13.479V20H23.2862V13.479H25.6839V12H19.1293V13.479H21.5271Z' fill='white' />
    </Svg>
  )
}
