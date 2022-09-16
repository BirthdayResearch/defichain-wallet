import { forwardRef } from "react";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { tailwind } from "@tailwind";

import { FlashList, FlashListProps } from "@shopify/flash-list";
import { View } from "react-native";
import { ThemedProps } from "./index";

type ThemedFlashListProps = FlashListProps<any> & ThemedProps;

export const ThemedFlashList = forwardRef(
  (props: ThemedFlashListProps, ref: React.Ref<any>): JSX.Element => {
    const { isLight } = useThemeContext();
    const {
      contentContainerStyle,
      light = tailwind("bg-mono-light-v2-100"),
      dark = tailwind("bg-mono-dark-v2-100"),
      estimatedItemSize = 5,
      ...otherProps
    } = props;
    const theme = isLight ? light : dark;
    const styles = { ...contentContainerStyle };

    return (
      <View style={[tailwind("flex-grow"), theme]}>
        <FlashList
          estimatedItemSize={estimatedItemSize}
          contentContainerStyle={styles}
          ref={ref}
          {...otherProps}
        />
      </View>
    );
  }
);
