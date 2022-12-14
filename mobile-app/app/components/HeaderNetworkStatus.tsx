import { useServiceProviderContext } from "@contexts/StoreServiceProvider";
import { useNetworkContext } from "@waveshq/walletkit-ui";
import { RootState } from "@store";
import { getColor, tailwind } from "@tailwind";
import { translate } from "@translations";
import {
  Platform,
  StyleProp,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useSelector } from "react-redux";
import { NetworkIcon } from "./icons/assets/NetworkIcon";
import { ThemedTextV2 } from "./themed";

export function HeaderNetworkStatus({
  onPress,
  testID,
  containerStyle,
}: {
  onPress: () => void;
  testID?: string;
  containerStyle?: StyleProp<ViewStyle>;
}): JSX.Element {
  const { network } = useNetworkContext();
  const { isCustomUrl } = useServiceProviderContext();
  const { connected } = useSelector((state: RootState) => state.block);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        tailwind("items-center justify-center", {
          "pt-0.5": Platform.OS !== "ios",
        }),
        containerStyle,
      ]}
      testID={testID ?? "header_active_network"}
    >
      <NetworkIcon
        testID="header_network_icon"
        pathColor={connected ? getColor("green-v2") : getColor("red-v2")}
      />
      <ThemedTextV2
        ellipsizeMode="tail"
        numberOfLines={1}
        lineBreakMode="tail"
        style={tailwind("font-bold-v2 text-2xs leading-3")}
        testID="header_network_name"
      >
        {network}
      </ThemedTextV2>
      {isCustomUrl && (
        <View>
          <ThemedTextV2
            style={[tailwind("font-bold-v2 leading-4"), { fontSize: 6 }]}
            testID="header_custom_active_network"
          >
            {translate("screens/ServiceProviderScreen", "Custom")}
          </ThemedTextV2>
        </View>
      )}
    </TouchableOpacity>
  );
}
