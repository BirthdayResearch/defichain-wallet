import {
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2,
} from "@components/themed";
import { tailwind } from "@tailwind";
import { useAddressLabel } from "@hooks/useAddressLabel";
import { RandomAvatar } from "./RandomAvatar";

interface AddressSelectionButtonProps {
  address: string;
  addressLength: number;
  onPress?: () => void;
  disabled?: boolean;
}

export function AddressSelectionButtonV2(
  props: AddressSelectionButtonProps
): JSX.Element {
  const addressLabel = useAddressLabel(props.address);
  return (
    <ThemedTouchableOpacityV2
      light={tailwind("bg-transparent")}
      dark={tailwind("bg-transparent")}
      style={tailwind("flex flex-row items-center overflow-hidden")}
      onPress={props.onPress}
      testID="switch_account_button"
      disabled={props.disabled}
    >
      <ThemedViewV2
        light={tailwind("bg-mono-light-v2-900")}
        dark={tailwind("bg-mono-dark-v2-900")}
        style={tailwind("p-0.5 rounded-full")}
      >
        <RandomAvatar name={props.address} size={24} />
      </ThemedViewV2>
      <ThemedTextV2
        ellipsizeMode="middle"
        numberOfLines={1}
        style={[
          tailwind("text-sm font-semibold-v2 ml-2"),
          { minWidth: 10, maxWidth: 124 },
        ]}
        testID="wallet_address"
      >
        {addressLabel != null ? addressLabel : props.address}
      </ThemedTextV2>
    </ThemedTouchableOpacityV2>
  );
}
