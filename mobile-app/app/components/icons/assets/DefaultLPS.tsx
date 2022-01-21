import Svg, { SvgProps, Text, G, Path } from 'react-native-svg'

export function DefaultLPS (symbol: string): (props: SvgProps) => JSX.Element {
  return function (props: SvgProps): JSX.Element {
    const [tokenA, tokenB] = symbol.split('-')
    return (
      <Svg width='32' height='32' viewBox='0 0 32 32' fill='none' {...props}>
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
          y='47%'
          textAnchor='middle'
          fontSize={9}
          fill='white'
          fontWeight='bold'
        >
          {tokenA}
        </Text>
        <Text
          x='50%'
          y='77%'
          textAnchor='middle'
          fontSize={9}
          fill='white'
          fontWeight='bold'
        >
          {tokenB}
        </Text>
      </Svg>
    )
  }
}
