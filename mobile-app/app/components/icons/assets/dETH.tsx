import Svg, { Circle, Path, SvgProps } from 'react-native-svg'

export function dETH (props: SvgProps): JSX.Element {
  return (
    <Svg
      height={32}
      width={32}
      viewBox='0 0 32 32'
      {...props}
    >
      <Circle
        cx={16}
        cy={16}
        fill='#E0E5FB'
        r={16}
      />

      <Path
        d='M23.5 17.616l-7.502 10.379v-6.027l7.502-4.352zm-7.502-4.744v7.701L8.5 16.22l7.498-3.348zm0-8.872l7.497 12.22-7.497-3.35V4z'
        fill='#FFF'
      />

      <Path
        d='M23.5 17.616l-7.502 10.379v-6.027l7.502-4.352zm-7.502-4.744v7.701L8.5 16.22l7.498-3.348zm0-8.872l7.497 12.22-7.497-3.35V4z'
        fill='#627EEA'
        fillOpacity={0.8}
      />

      <Path
        d='M8.5 17.616l7.498 4.351v6.028L8.5 17.616zM15.998 4v8.87L8.5 16.22 15.998 4z'
        fill='#FFF'
      />

      <Path
        d='M8.5 17.616l7.498 4.351v6.028L8.5 17.616zM15.998 4v8.87L8.5 16.22 15.998 4z'
        fill='#627EEA'
        fillOpacity={0.6}
      />

      <Path
        d='M15.998 20.573l7.497-4.353-7.497-3.348z'
        fill='#627EEA'
      />
    </Svg>
  )
}
