import { StyleSheet, View } from "react-native";
import {
  CodeField,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import { useStyles } from "@tailwind";
import { useThemeContext } from "@shared-contexts/ThemeProvider";

export interface PinTextInputItem {
  cellCount: number;
  testID: string;
  value: string;
  onChange: (text: string) => void;
  autofocus?: boolean;
}

export interface RenderCellItem {
  index: number;
  symbol: string;
  isFocused: boolean;
}

export function PinTextInputV2({
  cellCount,
  testID,
  value,
  onChange,
  autofocus = true,
}: PinTextInputItem): JSX.Element {
  const { getColor, tailwind } = useStyles();
  const ref = useBlurOnFulfill({ value, cellCount });
  const { isLight } = useThemeContext();
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue: onChange,
  });

  const rowStyle = {
    borderColorDark: {
      borderColor: getColor("mono-dark-v2-900"),
    },
    borderColorLight: {
      borderColor: getColor("mono-light-v2-900"),
    },
    cell: {
      alignItems: "center" as "center",
      backgroundColor: "transparent",
      borderRadius: 10,
      borderStyle: "solid" as  "solid",
      borderWidth: 1,
      display: "flex" as "flex",
      fontSize: 20,
      fontWeight: "500",
      height: 20,
      justifyContent: "center" as "center",
      lineHeight: 20,
      marginLeft: 25,
      paddingLeft: 1,
      paddingTop: 1,
      textAlign: "center",
      width: 20,
    },
    filledCellDark: {
      backgroundColor: getColor("mono-dark-v2-900"),
      borderColor: getColor("mono-dark-v2-900"),
      borderRadius: 10,
    },
    filledCellLight: {
      backgroundColor: getColor("mono-light-v2-900"),
      borderColor: getColor("mono-light-v2-900"),
      borderRadius: 10,
    },
  };

  const renderCell = ({ index, symbol }: RenderCellItem): JSX.Element => {
    const hasValue = symbol !== undefined && symbol !== "";
    return (
      <View
        key={index}
        onLayout={getCellOnLayoutHandler(index)}
        style={[
          rowStyle.cell,
          isLight && rowStyle.borderColorLight,
          !isLight && rowStyle.borderColorDark,
          hasValue && isLight && rowStyle.filledCellLight,
          hasValue && !isLight && rowStyle.filledCellDark,
          index === 0 && { marginLeft: 0 },
        ]}
        testID={`${testID}_${index}`}
      />
    );
  };

  return (
    <View style={tailwind("flex-row justify-center")}>
      <CodeField
        ref={ref}
        {...props}
        autoFocus={autofocus}
        cellCount={cellCount}
        keyboardType="number-pad"
        onChangeText={onChange}
        renderCell={renderCell}
        testID={testID}
        textContentType="oneTimeCode"
        value={value}
      />
    </View>
  );
}
