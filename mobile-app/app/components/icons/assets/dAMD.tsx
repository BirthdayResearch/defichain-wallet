import * as React from 'react'
import Svg, { Path, SvgProps } from 'react-native-svg'

export function dAMD (props: SvgProps): JSX.Element {
  return (
    <Svg
      height={32}
      width={32}
      viewBox='0 0 32 32'
      {...props}
    >
      <Path
        d='M16,0 C7.163,0 0,7.163 0,16 C0,24.837 7.163,32 16,32 C24.838,32 32,24.837 32,16 C32,7.163 24.838,0 16,0 L16,0 Z'
        id='Path' fill='#F4F3F6'
      />
      <Path
        d='M12.486997,13.232398 L12.486997,19.5131707 L18.7666796,19.5131707 L14.2799342,24 L8,24 L8,17.7192273 L12.486997,13.232398 Z M23.9998323,8 L23.9998323,23.8665004 L19.641639,19.5080555 L19.641639,12.358948 L12.4921122,12.358948 L8.13391893,8 L23.9998323,8 Z'
        id='Combined-Shape' fill='#000000' fill-rule='nonzero'
      />
    </Svg>
  )
}
