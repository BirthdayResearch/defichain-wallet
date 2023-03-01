import { ThemedProps, ThemedTextInputV2 } from "@components/themed";
import { useThemeContext } from "@waveshq/walletkit-ui";
import { getColor, tailwind } from "@tailwind";
import { Control, Controller } from "react-hook-form";
import { TextInputProps } from "react-native";

/**
 * React-hook-form themed text input
 */

interface Props {
  name: string;
  control: Control<any, any>;
  value: any;
  defaultValue?: string | number;
  rules?: any;
  inputProps: TextInputProps & ThemedProps;
  testID: string;
}

export function ControlledTextInput(props: Props): JSX.Element {
  const { isLight } = useThemeContext();

  return (
    <Controller
      control={props.control}
      defaultValue={props.defaultValue ?? ""}
      name={props.name}
      render={({ field: { onChange, value } }) => (
        <ThemedTextInputV2
          style={tailwind("text-xl font-semibold-v2 w-full")}
          light={tailwind("text-mono-light-v2-900")}
          dark={tailwind("text-mono-dark-v2-900")}
          value={value}
          onBlur={async () => {
            await onChange(value?.trim());
          }}
          placeholderTextColor={getColor(
            isLight ? "mono-light-v2-500" : "mono-dark-v2-500"
          )}
          testID={props.testID}
          {...props.inputProps}
        />
      )}
      rules={props.rules}
    />
  );
}
