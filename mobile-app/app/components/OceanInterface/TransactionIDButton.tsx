import { tailwind } from "@tailwind";
import {
  ThemedIcon,
  ThemedProps,
  ThemedTextV2,
  ThemedTouchableOpacity,
} from "@components/themed";

interface TransactionIDButtonProps {
  testID: string;
  txid: string;
  onPress?: () => void;
  styleProps?: string;
}

export function TransactionIDButton({
  testID,
  txid,
  onPress,
  styleProps = "w-8/12",
  light = tailwind("border-0"),
  dark = tailwind("border-0"),
}: TransactionIDButtonProps & ThemedProps): JSX.Element {
  return (
    <ThemedTouchableOpacity
      onPress={onPress}
      style={tailwind(`flex-row mt-1 items-center ${styleProps}`)}
      testID={testID}
      light={light}
      dark={dark}
    >
      <ThemedTextV2
        dark={tailwind("text-mono-dark-v2-700")}
        light={tailwind("text-mono-light-v2-700")}
        ellipsizeMode="middle"
        numberOfLines={1}
        style={tailwind("text-sm font-normal-v2 mr-1")}
      >
        {txid}
      </ThemedTextV2>

      <ThemedIcon
        dark={tailwind("text-mono-dark-v2-700")}
        light={tailwind("text-mono-light-v2-700")}
        iconType="Feather"
        name="external-link"
        size={16}
      />
    </ThemedTouchableOpacity>
  );
}
