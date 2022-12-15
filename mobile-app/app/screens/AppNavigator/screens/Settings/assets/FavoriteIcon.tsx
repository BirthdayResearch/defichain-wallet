import Svg, { Path } from "react-native-svg";
import { getColor } from "@tailwind";
import { useThemeContext } from "@waveshq/walletkit-ui";

interface FavoriteIconI {
  size: number;
  testID?: string;
  dark?: string;
  light?: string;
}

export function FavoriteCheckIcon({
  testID,
  size,
  dark = getColor("brand-v2-500"),
  light = getColor("brand-v2-500"),
}: FavoriteIconI): JSX.Element {
  const { isLight } = useThemeContext();
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      testID={testID}
    >
      <Path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill={isLight ? light : dark}
      />
    </Svg>
  );
}

export function FavoriteUnCheckIcon({
  testID,
  size,
}: FavoriteIconI): JSX.Element {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      testID={testID}
    >
      <Path
        d="M11 1L14.09 7.26L21 8.27L16 13.14L17.18 20.02L11 16.77L4.82 20.02L6 13.14L1 8.27L7.91 7.26L11 1Z"
        stroke={getColor("mono-light-v2-700")}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
