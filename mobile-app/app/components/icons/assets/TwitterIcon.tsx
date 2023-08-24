import Svg, { Path, SvgProps } from "react-native-svg";

export function TwitterIcon({
  testID,
  color,
  ...props
}: SvgProps): JSX.Element {
  return (
    <Svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      testID={testID}
      {...props}
    >
      <Path
        d="M10.0681 10.8965L20.8786 25.3514L10 37.1035H12.4485L21.9729 26.8141L29.6681 37.1035H38L26.581 21.8358L36.7069 10.8965H34.2584L25.4872 20.3726L18.4 10.8965H10.0681ZM13.6688 12.7004H17.4964L34.3989 35.3001H30.5712L13.6688 12.7004Z"
        fill={color}
      />
    </Svg>
  );
}
