import { forwardRef } from "react";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { tailwind } from "@tailwind";

import { FlashList, FlashListProps } from "@shopify/flash-list";
import { ScrollView, ScrollViewProps } from "react-native";
import { ThemedProps } from "./index";

interface ParentContainer {
  parentContainerStyle?: { [p: string]: string };
  scrollViewProps?: ScrollViewProps;
}

type ThemedFlashListProps = FlashListProps<any> & ThemedProps & ParentContainer;

export const ThemedFlashList = forwardRef(
  (props: ThemedFlashListProps, ref: React.Ref<any>): JSX.Element => {
    const { isLight } = useThemeContext();
    const {
      contentContainerStyle,
      light = tailwind("bg-mono-light-v2-100"),
      dark = tailwind("bg-mono-dark-v2-100"),
      estimatedItemSize = 5,
      parentContainerStyle,
      scrollViewProps,
      ...otherProps
    } = props;
    const theme = isLight ? light : dark;
    const styles = { ...contentContainerStyle };

    return (
      <ScrollView
        contentContainerStyle={[
          tailwind("flex-grow"),
          parentContainerStyle,
          theme,
        ]}
        {...scrollViewProps}
      >
        <FlashList
          estimatedItemSize={estimatedItemSize}
          contentContainerStyle={styles}
          ref={ref}
          {...otherProps}
        />
      </ScrollView>
    );
  }
);
