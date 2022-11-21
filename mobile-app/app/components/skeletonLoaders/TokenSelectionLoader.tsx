import * as React from "react";
import ContentLoader, {
  Circle,
  IContentLoaderProps,
  Rect,
} from "react-content-loader/native";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { useStyles } from "@tailwind";
import { ThemedViewV2 } from "../themed";

export function TokenSelectionLoader(
  props: JSX.IntrinsicAttributes &
    IContentLoaderProps & { children?: React.ReactNode }
): JSX.Element {
  const { isLight } = useThemeContext();
  const { tailwind } = useStyles();
  return (
    <ThemedViewV2
      dark={tailwind("bg-mono-dark-v2-00")}
      light={tailwind("bg-mono-light-v2-00")}
      style={tailwind("py-3 mt-2 items-center justify-center rounded-lg-v2")}
      testID="token_selection_skeleton_loader"
    >
      <ContentLoader
        backgroundColor={isLight ? "#ecebeb" : "#2f2f2f"}
        foregroundColor={isLight ? "#ffffff" : "#4a4a4a"}
        height={44}
        preserveAspectRatio="xMidYMid slice"
        speed={2}
        viewBox="0 0 328 44"
        width="100%"
        {...props}
      >
        <Circle cx="32" cy="22" r="15" />
        <Rect x="58" y="4" rx="5" ry="5" width="90" height="16" />
        <Rect x="58" y="25" rx="5" ry="5" width="90" height="12" />

        <Rect x="220" y="4" rx="5" ry="5" width="88" height="16" />
        <Rect x="220" y="25" rx="5" ry="5" width="88" height="12" />
      </ContentLoader>
    </ThemedViewV2>
  );
}
