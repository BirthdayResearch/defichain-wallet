import randomColor from 'randomcolor'
import Svg, { Circle, SvgProps, Text } from 'react-native-svg'

export function DefaultToken (symbol: string): (props: SvgProps) => JSX.Element {
  return function (props: SvgProps): JSX.Element {
    const bg = randomColor({
      luminosity: 'bright',
      format: 'rgba',
      seed: symbol,
      alpha: 0.2
    })
    const text = randomColor({
      luminosity: 'dark',
      format: 'rgba',
      seed: symbol,
      alpha: 100
    })
    const first = symbol?.substring(0, 1)?.toUpperCase() ?? 'T'

    return (
      <Svg
        height={32}
        viewBox='0 0 32 32'
        width={32}
        {...props}
      >
        <Circle
          cx={16}
          cy={16}
          fill={bg}
          r={16}
        />

        <Text
          alignmentBaseline='central'
          fill={text}
          fontSize='24'
          fontWeight='bolder'
          textAnchor='middle'
          x='50%'
          y='50%'
        >
          {first}
        </Text>
      </Svg>
    )
  }
}
