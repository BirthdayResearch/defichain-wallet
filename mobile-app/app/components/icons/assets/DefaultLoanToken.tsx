import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { getColor } from '@tailwind'
import Svg, { SvgProps, Text, G, Path } from 'react-native-svg'

export function DefaultLoanToken (symbol: string): (props: SvgProps) => JSX.Element {
  const { isLight } = useThemeContext()
  return function (props: SvgProps): JSX.Element {
    const name = symbol.substring(1, 6).toUpperCase()
    return (
      <Svg width='32' height='32' viewBox='0 0 36 36' fill='none' {...props}>
        <G clipPath='url(#clip0_1388_11287)'>
          <Path
            d='M0.25061 18C0.25061 8.19645 8.19706 0.25 18.0006 0.25C27.8053 0.25 35.7506 8.19644 35.7506 18C35.7506 27.8036 27.8053 35.75 18.0006 35.75C8.19706 35.75 0.25061 27.8036 0.25061 18Z'
            fill='#0E0A0D'
            strokeWidth={0.5}
            stroke={getColor(isLight ? 'mono-light-v2-300' : 'mono-dark-v2-300')}
            fillRule='evenodd'
            clipRule='evenodd'
          />
        </G>
        <Text
          x='50%'
          y={name.length > 4 ? '58%' : '62%'}
          fontSize={name.length > 4 ? 8 : 10}
          textAnchor='middle'
          fill='white'
          fontWeight='bold'
        >
          {name}
        </Text>
      </Svg>
    )
  }
}
