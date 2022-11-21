import { View } from "react-native";
import { useStyles } from "@tailwind";
import {
  ThemedTextV2,
  ThemedIcon,
  ThemedTouchableOpacityV2,
} from "@components/themed";
import { getNativeIcon } from "@components/icons/assets";

interface ViewPoolHeaderProps {
  tokenASymbol: string;
  tokenBSymbol: string;
  headerLabel: string;
  testID?: string;
  onPress: () => void;
}

export function ViewPoolHeader({
  tokenASymbol,
  tokenBSymbol,
  headerLabel,
  testID,
  onPress,
}: ViewPoolHeaderProps): JSX.Element {
  const { tailwind } = useStyles();
  const TokenIconA = getNativeIcon(tokenASymbol);
  const TokenIconB = getNativeIcon(tokenBSymbol);
  return (
    <View style={tailwind("items-center")}>
      <View>
        <TokenIconA style={tailwind("absolute z-50")} width={56} height={56} />
        <TokenIconB style={tailwind("ml-9 z-40")} width={56} height={56} />
      </View>
      <ThemedTextV2
        dark={tailwind("text-mono-dark-v2-900")}
        light={tailwind("text-mono-light-v2-900")}
        style={tailwind("mt-2 text-lg font-semibold-v2")}
      >
        {`${tokenASymbol}-${tokenBSymbol}`}
      </ThemedTextV2>
      <ThemedTouchableOpacityV2
        style={tailwind("flex-row mt-1")}
        onPress={onPress}
        testID={testID}
      >
        <ThemedIcon
          size={16}
          name="info-outline"
          iconType="MaterialIcons"
          dark={tailwind("text-mono-dark-v2-700")}
          light={tailwind("text-mono-light-v2-700")}
        />
        <ThemedTextV2
          dark={tailwind("text-mono-dark-v2-700")}
          light={tailwind("text-mono-light-v2-700")}
          style={tailwind("ml-1 text-xs font-semibold-v2")}
        >
          {headerLabel}
        </ThemedTextV2>
      </ThemedTouchableOpacityV2>
    </View>
  );
}
