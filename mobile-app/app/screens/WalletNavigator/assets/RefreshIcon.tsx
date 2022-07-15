import Svg, { Path } from 'react-native-svg'

interface RefreshIconProps {
  color: string
  size?: number
}

export function RefreshIcon ({ color, size = 24 }: RefreshIconProps): JSX.Element {
  return (
    <Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
      <Path d='M15 6.84375C15 6.84375 16.1419 6.28125 12 6.28125C10.5166 6.28125 9.0666 6.72112 7.83323 7.54523C6.59986 8.36934 5.63856 9.54068 5.07091 10.9111C4.50325 12.2816 4.35472 13.7896 4.64411 15.2444C4.9335 16.6993 5.64781 18.0357 6.6967 19.0846C7.7456 20.1334 9.08197 20.8478 10.5368 21.1371C11.9917 21.4265 13.4997 21.278 14.8701 20.7103C16.2406 20.1427 17.4119 19.1814 18.236 17.948C19.0601 16.7147 19.5 15.2646 19.5 13.7812' stroke={color} strokeWidth='1.5' strokeMiterlimit='10' strokeLinecap='round' />
      <Path d='M12 2.71875L15.75 6.46875L12 10.2188' stroke={color} strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
    </Svg>
  )
}
