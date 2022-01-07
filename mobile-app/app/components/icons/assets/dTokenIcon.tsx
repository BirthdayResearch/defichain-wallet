import Svg, { G, Path, SvgProps, Text } from 'react-native-svg'
import tailwind from 'tailwind-rn'

export function dTokenIcon (symbol: string): (props: SvgProps) => JSX.Element {
  return function (props: SvgProps): JSX.Element {
    const name = symbol.substring(1, 5).toUpperCase()
    return (
      <Svg width='32' height='32' viewBox='0 0 32 32' fill='none' style={tailwind('font-bold')} {...props}>
        <G clipPath='url(#clip0_1388_11287)'>
          <Path
            fillRule='evenodd'
            clipRule='evenodd'
            d='M16 0C7.163 0 0 7.163 0 16C0 24.837 7.163 32 16 32C24.838 32 32 24.837 32 16C32 7.163 24.838 0 16 0Z'
            fill='#0E0A0D'
          />
        </G>
        <Text
          x='50%'
          y='60%'
          textAnchor='middle'
          fontSize={9}
          fill='white'
        >
          {name}
        </Text>
      </Svg>
    )
  }
}
