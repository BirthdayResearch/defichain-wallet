import * as React from "react";
import ContentLoader, {
  Circle,
  IContentLoaderProps,
  Rect,
} from "react-content-loader/native";
import { useThemeContext } from "@waveshq/walletkit-ui";
import { tailwind } from "@tailwind";
import { ThemedViewV2 } from "../themed";

export function DexSkeletonLoader(
  props: JSX.IntrinsicAttributes &
    IContentLoaderProps & { children?: React.ReactNode }
): JSX.Element {
  const { isLight } = useThemeContext();
  return (
    <ThemedViewV2
      style={tailwind("px-5 py-4 mb-2 rounded-lg-v2")}
      dark={tailwind("bg-mono-dark-v2-00")}
      light={tailwind("bg-mono-light-v2-00")}
      testID="dex_skeleton_loader"
    >
      <ContentLoader
        backgroundColor={isLight ? "#ecebeb" : "#2f2f2f"}
        foregroundColor={isLight ? "#ffffff" : "#4a4a4a"}
        height={88}
        preserveAspectRatio="xMidYMid slice"
        speed={2}
        viewBox="0 0 335 88"
        width="100%"
        {...props}
      >
        <Circle cx="35" cy="25" r="20" />
        <Rect x="60" y="12" rx="4" ry="4" width="112" height="24" />
        <Rect x="256" y="7" rx="4" ry="4" width="64" height="30" />

        <Rect x="10" y="55" rx="4" ry="4" width="200" height="12" />
        <Rect x="10" y="70" rx="4" ry="4" width="200" height="12" />

        <Rect x="248" y="55" rx="4" ry="4" width="72" height="30" />
      </ContentLoader>
    </ThemedViewV2>
  );
}
