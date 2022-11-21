import * as React from "react";
import ContentLoader, {
  Circle,
  IContentLoaderProps,
  Rect,
} from "react-content-loader/native";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { useStyles } from "@tailwind";
import { ThemedViewV2 } from "../themed";

type BrowseAuctionsLoaderProps = JSX.IntrinsicAttributes &
  IContentLoaderProps & { children?: React.ReactNode };

export function BrowseAuctionsLoader(
  props: BrowseAuctionsLoaderProps
): JSX.Element {
  const { isLight } = useThemeContext();
  const { tailwind } = useStyles();
  return (
    <ThemedViewV2
      light={tailwind("bg-mono-light-v2-00")}
      dark={tailwind("bg-mono-dark-v2-00")}
      style={tailwind("p-5 mb-2 rounded-lg-v2 items-center justify-center")}
      testID="browse_auctions_skeleton_loader"
    >
      <ContentLoader
        backgroundColor={isLight ? "#ecebeb" : "#2f2f2f"}
        foregroundColor={isLight ? "#ffffff" : "#4a4a4a"}
        speed={2}
        width="100%"
        height={84}
        viewBox="0 0 289 84"
        {...props}
      >
        <Circle cx="16" cy="19" r="16" />
        <Rect x="160" y="4" rx="5" ry="5" width="140" height="24" />
        <Rect x="200" y="30" rx="5" ry="5" width="100" height="12" />
        <Rect x="0" y="55" rx="3" ry="3" width="50" height="12" />
        <Rect x="190" y="51" rx="20" ry="20" width="110" height="32" />
        <Rect x="0" y="69" rx="3" ry="3" width="140" height="12" />
      </ContentLoader>
    </ThemedViewV2>
  );
}
