import { useStyles } from "@tailwind";
import { ThemedIcon, ThemedTextV2 } from "@components/themed";
import { translate } from "@translations";
import { TouchableOpacity, View } from "react-native";

interface PriceOracleInfoProps {
  text: string;
  onPress: () => void;
}
export function PriceOracleInfo(props: PriceOracleInfoProps): JSX.Element {
  const { tailwind } = useStyles();
  return (
    <View style={tailwind("items-center")} testID="oracle_price_info">
      <TouchableOpacity
        onPress={props.onPress}
        style={tailwind("text-center flex-row items-center")}
      >
        <ThemedTextV2
          dark={tailwind("text-mono-dark-v2-500")}
          light={tailwind("text-mono-light-v2-500")}
          style={tailwind("font-normal-v2 text-sm mr-1")}
        >
          {translate("components/PriceOracleInfo", props.text)}
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
