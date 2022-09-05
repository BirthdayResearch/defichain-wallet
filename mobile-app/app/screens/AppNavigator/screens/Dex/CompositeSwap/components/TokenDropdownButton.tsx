import {
  ThemedIcon,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
} from "@components/themed";
import { getNativeIcon } from "@components/icons/assets";
import { tailwind } from "@tailwind";
import { translate } from "@translations";

export function TokenDropdownButton(props: {
  symbol?: string;
  onPress: () => void;
  disabled?: boolean;
}): JSX.Element {
  const Icon = getNativeIcon(props.symbol ?? "");
  return (
    <ThemedTouchableOpacityV2
      onPress={props.onPress}
      testID="token_select_button"
      dark={tailwind("bg-mono-dark-v2-00 text-mono-dark-v2-500", {
        "opacity-30": props.disabled,
        "opacity-100": !props.disabled,
      })}
      light={tailwind("bg-mono-light-v2-00 text-mono-light-v2-500", {
        "opacity-30": props.disabled,
        "opacity-100": !props.disabled,
      })}
      style={tailwind("flex flex-row items-center rounded-xl-v2 px-3 py-2.5")}
      disabled={props.disabled}
    >
      {props.symbol === undefined && (
        <ThemedTextV2
          dark={tailwind("text-mono-dark-v2-500")}
          light={tailwind("text-mono-light-v2-500")}
          style={tailwind("text-sm leading-6 font-normal-v2 mr-2.5")}
        >
          {translate("screens/CompositeSwapScreen", "Select token")}
        </ThemedTextV2>
      )}
      {props.symbol !== undefined && (
        <>
          <Icon testID="tokenA_icon" height={28} width={28} />
          <ThemedTextV2
            style={tailwind("ml-2 mr-3.5 text-sm font-semibold-v2")}
            dark={tailwind("text-mono-dark-v2-900", {
              "text-opacity-30": props.disabled,
            })}
            light={tailwind("text-mono-light-v2-900", {
              "text-opacity-30": props.disabled,
            })}
          >
            {props.symbol}
          </ThemedTextV2>
        </>
      )}
      <ThemedIcon
        iconType="Feather"
        name="chevron-down"
        size={24}
        dark={tailwind("text-mono-dark-v2-700")}
        light={tailwind("text-mono-light-v2-700")}
      />
    </ThemedTouchableOpacityV2>
  );
}
