import * as React from "react";
import ContentLoader, {
  Circle,
  IContentLoaderProps,
  Rect,
} from "react-content-loader/native";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { tailwind } from "@tailwind";
import { View } from "react-native";
import { ThemedViewV2 } from "../themed";

type LoanSkeletonLoaderProps = JSX.IntrinsicAttributes &
  IContentLoaderProps & { children?: React.ReactNode };

function LoanLoader({
  props,
  isLight,
}: {
  props: LoanSkeletonLoaderProps;
  isLight: boolean;
}): JSX.Element {
  return (
    <ContentLoader
      backgroundColor={isLight ? "#ecebeb" : "#2f2f2f"}
      foregroundColor={isLight ? "#ffffff" : "#4a4a4a"}
      speed={2}
      width="100%"
      height={112}
      viewBox="0 0 163 144"
      {...props}
    >
      <Rect x="48" y="24" rx="6" ry="6" width="90" height="14" />
      <Rect x="13" y="56" rx="5" ry="5" width="51" height="12" />
      <Rect x="13" y="75" rx="6" ry="6" width="96" height="12" />
      <Circle cx="26" cy="31" r="13" />
      <Rect x="13" y="100" rx="6" ry="6" width="51" height="12" />
      <Rect x="13" y="118" rx="6" ry="6" width="96" height="12" />
    </ContentLoader>
  );
}

export function LoanSkeletonLoaderV2(
  loaderProps: LoanSkeletonLoaderProps
): JSX.Element {
  const { isLight } = useThemeContext();
  const skeletonCols = Array.from(Array(2), (_v, i) => i + 1);

  return (
    <View
      style={tailwind("flex-row justify-around mx-2")}
      testID="loan_skeleton_loader"
    >
      {skeletonCols.map((_col, i) => (
        <ThemedViewV2
          light={tailwind("bg-mono-light-v2-00")}
          dark={tailwind("bg-mono-dark-v2-00")}
          style={[
            tailwind("p-4 mx-2 mb-4 rounded-lg-v2"),
            { flexBasis: "47%" },
          ]}
          key={i}
        >
          <LoanLoader props={loaderProps} isLight={isLight} />
        </ThemedViewV2>
      ))}
    </View>
  );
}
