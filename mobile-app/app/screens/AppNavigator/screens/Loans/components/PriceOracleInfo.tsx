import { tailwind } from "@tailwind";
import { ThemedIcon, ThemedTextV2 } from "@components/themed";
import { translate } from "@translations";
import { View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

interface PriceOracleInfoProps {
  onPress: () => void;
}
export function PriceOracleInfo(props: PriceOracleInfoProps): JSX.Element {
  return (
    <View style={tailwind("items-center")}>
      <TouchableOpacity
        onPress={props.onPress}
        style={tailwind("text-center flex-row items-center")}
      >
        <ThemedTextV2
          dark={tailwind("text-mono-dark-v2-500")}
          light={tailwind("text-mono-light-v2-500")}
          style={tailwind("font-normal-v2 text-sm mr-1")}
        >
          {translate(
            "screens/LoansScreen",
            "Loan tokens get their prices from oracles."
          )}
        </ThemedTextV2>

        <ThemedIcon
          dark={tailwind("text-mono-dark-v2-700")}
          light={tailwind("text-mono-light-v2-700")}
          iconType="MaterialIcons"
          name="info-outline"
          size={16}
        />
      </TouchableOpacity>
    </View>
  );
}
