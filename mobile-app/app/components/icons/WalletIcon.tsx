import Svg, { Path, Rect, SvgProps } from "react-native-svg";

export function WalletIcon(props: SvgProps): JSX.Element {
  return (
    <Svg width="12" height="12" viewBox="0 0 12 12" fill="none" {...props}>
      <Rect
        x="1"
        y="2"
        width="9.53"
        height="9"
        rx="1"
        stroke={props.color}
        strokeWidth="1.5"
      />
      <Path
        d="M5.75 6.5C5.75 6.08579 6.08579 5.75 6.5 5.75H9.25V7.25H6.5C6.08579 7.25 5.75 6.91421 5.75 6.5Z"
        stroke={props.color}
        stroke-width="1.5"
      />
    </Svg>
  );
}
