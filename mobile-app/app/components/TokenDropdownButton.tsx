import {
  ThemedIcon,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
} from "@components/themed";
import { getNativeIcon } from "@components/icons/assets";
import { tailwind } from "@tailwind";
import { translate } from "@translations";

export enum TokenDropdownButtonStatus {
  Active,
  Enabled,
  Locked,
  Disabled,
}

export function TokenDropdownButton(props: {
  symbol?: string;
  testID: string;
  onPress?: () => void;
  status: TokenDropdownButtonStatus;
}): JSX.Element {
  const Icon =
    props.symbol !== undefined ? getNativeIcon(props.symbol) : undefined;
  return (
    <ThemedTouchableOpacityV2
      onPress={props.onPress}
      testID={`token_select_button_${props.testID}`}
      dark={tailwind("bg-mono-dark-v2-00 text-mono-dark-v2-500", {
        "opacity-30": props.status === TokenDropdownButtonStatus.Disabled,
        "opacity-100": props.status !== TokenDropdownButtonStatus.Disabled,
      })}
      light={tailwind("bg-mono-light-v2-00 text-mono-light-v2-500", {
        "opacity-30": props.status === TokenDropdownButtonStatus.Disabled,
        "opacity-100": props.status !== TokenDropdownButtonStatus.Disabled,
      })}
      style={tailwind("flex flex-row items-center rounded-xl px-3 py-2.5")}
      disabled={props.status !== TokenDropdownButtonStatus.Enabled}
    >
      {props.symbol === undefined && (
        <ThemedTextV2
          dark={tailwind("text-mono-dark-v2-500")}
          light={tailwind("text-mono-light-v2-500")}
          style={tailwind("text-sm leading-6 font-normal-v2")}
        >
          {translate("screens/CompositeSwapScreen", "Token")}
        </ThemedTextV2>
      )}
      {props.symbol !== undefined && Icon !== undefined && (
        <>
          <Icon testID="tokenA_icon" height={24} width={24} />
          <ThemedTextV2
            style={tailwind("ml-2 text-sm font-semibold-v2")}
            dark={tailwind("text-mono-dark-v2-900", {
              "text-opacity-30":
                props.status === TokenDropdownButtonStatus.Disabled,
            })}
            light={tailwind("text-mono-light-v2-900", {
              "text-opacity-30":
                props.status === TokenDropdownButtonStatus.Disabled,
            })}
            testID={`token_select_button_${props.testID}_display_symbol`}
          >
            {props.symbol}
          </ThemedTextV2>
        </>
      )}
      {props.status !== TokenDropdownButtonStatus.Locked && (
        <ThemedIcon
          iconType="Feather"
          name="chevron-down"
          size={24}
          style={tailwind(
            { "ml-2.5": props.symbol === undefined },
            { "ml-3.5": props.symbol !== undefined }
          )}
          dark={tailwind("text-mono-dark-v2-700")}
          light={tailwind("text-mono-light-v2-700")}
        />
      )}
    </ThemedTouchableOpacityV2>
  );
}
