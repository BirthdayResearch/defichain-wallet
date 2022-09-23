import Svg, {
  G,
  Path,
  SvgProps,
  Text,
  Defs,
  Stop,
  LinearGradient,
} from "react-native-svg";

export function DefaultLoanToken(
  symbol: string,
  isLight: boolean
): (props: SvgProps) => JSX.Element {
  return function (props: SvgProps): JSX.Element {
    const GElement = G as any;
    const TextElement = Text as any;
    const name = symbol.substring(1, 6).toUpperCase();
    return (
      <Svg width="40" height="40" viewBox="0 0 36 36" fill="none" {...props}>
        <Defs>
          {/* @ts-ignore  */}
          <LinearGradient
            id="paint0_linear_7863_44577"
            x1="-1.8"
            y1="19"
            x2="38"
            y2="19"
            gradientUnits="userSpaceOnUse"
          >
            <Stop stop-color="#FF01AF" />
            <Stop offset="0.0703125" stopColor="#FB01AF" />
            <Stop offset="0.169271" stopColor="#EF01B1" />
            <Stop offset="0.289062" stopColor="#DB02B5" />
            <Stop offset="0.408854" stopColor="#C004BA" />
            <Stop offset="0.528646" stopColor="#9D06C0" />
            <Stop offset="0.648438" stopColor="#7208C8" />
            <Stop offset="0.815104" stopColor="#3F0BD1" />
            <Stop offset="1" stopColor="#0E0EDB" />
          </LinearGradient>
        </Defs>
        <GElement clipPath="url(#clip0_1388_11287)">
          <Path
            d="M0.25061 18C0.25061 8.19645 8.19706 0.25 18.0006 0.25C27.8053 0.25 35.7506 8.19644 35.7506 18C35.7506 27.8036 27.8053 35.75 18.0006 35.75C8.19706 35.75 0.25061 27.8036 0.25061 18Z"
            fill="#0E0A0D"
            strokeWidth={0.5}
            stroke="url(#paint0_linear_7863_44577)"
            fillRule="evenodd"
            clipRule="evenodd"
          />
        </GElement>
        <TextElement
          x="50%"
          y={name.length > 4 ? "59%" : "62%"}
          fontSize={name.length > 4 ? 8 : 10}
          textAnchor="middle"
          fill="white"
          fontWeight="bold"
        >
          {name}
        </TextElement>
      </Svg>
    );
  };
}
