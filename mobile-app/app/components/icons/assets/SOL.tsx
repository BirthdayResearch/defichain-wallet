import Svg, {
  Stop,
  Path,
  SvgProps,
  G,
  Defs,
  Rect,
  LinearGradient,
  ClipPath,
} from "react-native-svg";

export function SOL(props: SvgProps): JSX.Element {
  return (
    <Svg width="32" height="32" viewBox="0 0 32 32" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 18C0 8.05891 8.05891 0 18 0C27.9411 0 36 8.05891 36 18C36 27.9411 27.9411 36 18 36C8.05891 36 0 27.9411 0 18Z"
        fill="#0C192B"
      />
      <G clipPath="url(#clip0_7705_27225)">
        <Path
          d="M11.2487 21.9638C11.3694 21.8431 11.5353 21.7727 11.7113 21.7727H27.6731C27.9648 21.7727 28.1106 22.1247 27.9045 22.3309L24.7513 25.484C24.6306 25.6047 24.4647 25.6751 24.2887 25.6751H8.32688C8.0352 25.6751 7.88936 25.3231 8.09555 25.1169L11.2487 21.9638Z"
          fill="url(#paint0_linear_7705_27225)"
        />
        <Path
          d="M11.2486 10.1911C11.3743 10.0704 11.5403 10 11.7112 10H27.673C27.9647 10 28.1105 10.352 27.9043 10.5582L24.7512 13.7113C24.6305 13.832 24.4646 13.9024 24.2886 13.9024H8.32678C8.0351 13.9024 7.88926 13.5504 8.09545 13.3442L11.2486 10.1911Z"
          fill="url(#paint1_linear_7705_27225)"
        />
        <Path
          d="M24.7513 16.0397C24.6306 15.919 24.4647 15.8486 24.2887 15.8486H8.32688C8.0352 15.8486 7.88936 16.2007 8.09555 16.4068L11.2487 19.56C11.3694 19.6807 11.5353 19.7511 11.7113 19.7511H27.6731C27.9648 19.7511 28.1106 19.399 27.9045 19.1929L24.7513 16.0397Z"
          fill="url(#paint2_linear_7705_27225)"
        />
      </G>
      <Defs>
        <LinearGradient
          id="paint0_linear_7705_27225"
          x1="26.1483"
          y1="8.11642"
          x2="15.1015"
          y2="29.2755"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#00FFA3" />
          <Stop offset="1" stopColor="#DC1FFF" />
        </LinearGradient>
        <LinearGradient
          id="paint1_linear_7705_27225"
          x1="21.3179"
          y1="5.5946"
          x2="10.2711"
          y2="26.7537"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#00FFA3" />
          <Stop offset="1" stopColor="#DC1FFF" />
        </LinearGradient>
        <LinearGradient
          id="paint2_linear_7705_27225"
          x1="23.7178"
          y1="6.84748"
          x2="12.671"
          y2="28.0066"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#00FFA3" />
          <Stop offset="1" stopColor="#DC1FFF" />
        </LinearGradient>
        <ClipPath id="clip0_7705_27225">
          <Rect
            width="20"
            height="15.6751"
            fill="white"
            transform="translate(8 10)"
          />
        </ClipPath>
      </Defs>
    </Svg>
  );
}
