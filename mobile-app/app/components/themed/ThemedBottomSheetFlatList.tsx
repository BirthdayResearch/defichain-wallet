import { forwardRef } from "react";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { useStyles } from "@tailwind";

import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { BottomSheetFlatListProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetScrollable/types";
import { ThemedProps } from "./index";

type ThemedFlatListProps = BottomSheetFlatListProps<any> & ThemedProps;

export const ThemedBottomSheetFlatList = forwardRef(
  (props: ThemedFlatListProps, ref: React.Ref<any>): JSX.Element => {
    const { isLight } = useThemeContext();
    const { tailwind } = useStyles();
    const {
      style,
      light = tailwind("bg-mono-light-v2-100"),
      dark = tailwind("bg-mono-dark-v2-100"),
      ...otherProps
    } = props;

    return (
      <BottomSheetFlatList
        style={[style, isLight ? light : dark]}
        ref={ref}
        {...otherProps}
      />
    );
  }
);
