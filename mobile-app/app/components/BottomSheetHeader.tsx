import { tailwind } from "@tailwind";
import {
  ThemedIcon,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2,
} from "./themed";

interface Props {
  headerText: string;
  onClose: () => void;
}

export function BottomSheetHeader(props: Props): JSX.Element {
  return (
    <ThemedViewV2
      style={tailwind("flex flex-col px-5 pt-3 pb-5 rounded-t-xl-v2")}
    >
      <ThemedTouchableOpacityV2
        onPress={props.onClose}
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
      <ThemedTextV2 style={tailwind("text-xl font-normal-v2")}>
        {props.headerText}
      </ThemedTextV2>
    </ThemedViewV2>
  );
}
