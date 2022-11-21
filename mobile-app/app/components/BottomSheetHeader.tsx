import { useStyles } from "@tailwind";
import { StyleProp, ViewProps } from "react-native";
import {
  ThemedIcon,
  ThemedProps,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2,
} from "./themed";

interface Props {
  headerText: string;
  onClose: () => void;
  containerStyle?: StyleProp<ViewProps>;
  headerStyle?: {
    style: StyleProp<ViewProps>;
  } & ThemedProps;
}

export function BottomSheetHeader({
  headerText,
  headerStyle,
  containerStyle,
  onClose,
}: Props): JSX.Element {
  const { tailwind } = useStyles();
  return (
    <ThemedViewV2
      style={[
        tailwind("flex flex-col px-5 pt-3 pb-5 rounded-t-xl-v2"),
        containerStyle,
      ]}
    >
      <ThemedTouchableOpacityV2
        onPress={onClose}
        style={tailwind("self-end pt-2.5")}
      >
        <ThemedIcon
          dark={tailwind("text-mono-dark-v2-900")}
          light={tailwind("text-mono-light-v2-900")}
          iconType="Feather"
          name="x-circle"
          size={24}
        />
      </ThemedTouchableOpacityV2>
      <ThemedTextV2 style={tailwind("text-xl font-normal-v2")} {...headerStyle}>
        {headerText}
      </ThemedTextV2>
    </ThemedViewV2>
  );
}
