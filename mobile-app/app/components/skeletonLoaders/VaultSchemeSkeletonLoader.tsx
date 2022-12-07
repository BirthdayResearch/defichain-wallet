import * as React from "react";
import ContentLoader, {
  Circle,
  IContentLoaderProps,
  Rect,
} from "react-content-loader/native";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { useStyles } from "@tailwind";
import { ThemedViewV2 } from "@components/themed";

export function VaultSchemesSkeletonLoader(
  props: JSX.IntrinsicAttributes &
    IContentLoaderProps & { children?: React.ReactNode; last: boolean }
): JSX.Element {
  const { tailwind } = useStyles();
  const { isLight } = useThemeContext();
  const { last, ...otherProps } = props;
  return (
    <ThemedViewV2
      light={tailwind("bg-transparent border-mono-light-v2-300")}
      dark={tailwind("bg-transparent border-mono-dark-v2-300")}
      style={tailwind("mx-5 items-center justify-center", {
        "border-b-0.5": !last,
      })}
      testID="portfolio_skeleton_loader"
    >
      <ContentLoader
        backgroundColor={isLight ? "#ecebeb" : "#2f2f2f"}
        foregroundColor={isLight ? "#ffffff" : "#4a4a4a"}
        height={90}
        preserveAspectRatio="xMidYMid slice"
        speed={2}
        viewBox="0 0 300 90"
        width="100%"
        {...otherProps}
      >
        <Rect x="6" y="22" rx="4" ry="4" width="160" height="20" />
        <Rect x="6" y="50" rx="4" ry="4" width="160" height="20" />
        <Circle cx="280" cy="45" r="14" />
      </ContentLoader>
    </ThemedViewV2>
  );
}
