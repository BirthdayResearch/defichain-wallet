import { tailwind } from "@tailwind";
import { ThemedIcon, ThemedTextV2 } from "@components/themed";
import { translate } from "@translations";
import { Platform, View, TouchableOpacity } from "react-native";

interface PriceOracleInfoProps {
  onPress: () => void;
}
export function PriceOracleInfo(props: PriceOracleInfoProps): JSX.Element {
  return (
    <TouchableOpacity onPress={props.onPress} style={tailwind("items-center")}>
      <ThemedTextV2
        dark={tailwind("text-mono-dark-v2-500")}
        light={tailwind("text-mono-light-v2-500")}
        style={tailwind("font-normal-v2 text-sm relative")}
      >
        {translate(
          "screens/LoansScreen",
          "Loan tokens get their prices from oracles."
        )}
        {Platform.OS === "ios" && (
          <View style={tailwind("pl-1 pt-1")}>
            <ThemedIcon
              dark={tailwind("text-mono-dark-v2-700")}
              light={tailwind("text-mono-light-v2-700")}
              iconType="MaterialIcons"
              name="info-outline"
              size={16}
            />
          </View>
        )}
        {Platform.OS !== "ios" && (
          <ThemedIcon
            dark={tailwind("text-mono-dark-v2-700")}
            light={tailwind("text-mono-light-v2-700")}
            iconType="MaterialIcons"
            name="info-outline"
            size={16}
            style={tailwind("absolute ml-1")}
          />
        )}
      </ThemedTextV2>
    </TouchableOpacity>
  );
}
