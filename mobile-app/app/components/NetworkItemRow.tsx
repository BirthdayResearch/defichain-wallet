import { ThemedIcon, ThemedTouchableListItem } from "@components/themed";
import { WalletAlert } from "@components/WalletAlert";
import { useNetworkContext } from "@shared-contexts/NetworkContext";
import { EnvironmentNetwork, isPlayground } from "@waveshq/walletkit-core";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { SettingsParamList } from "@screens/AppNavigator/screens/Settings/SettingsNavigator";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { ThemedTextV2 } from "./themed/ThemedTextV2";

interface NetworkItemRowProps {
  network: EnvironmentNetwork;
  alertMessage: string;
  isLast: boolean;
  disabled?: boolean;
}

export function NetworkItemRow(props: NetworkItemRowProps): JSX.Element {
  const navigation = useNavigation<NavigationProp<SettingsParamList>>();
  const { network, updateNetwork } = useNetworkContext();

  const onPress = async (): Promise<void> => {
    if (props.network === network) {
      if (isPlayground(props.network)) {
        navigation.navigate("Playground");
      }
    } else {
      WalletAlert({
        title: translate("screens/Settings", "Network Switch"),
        message: props.alertMessage,
        buttons: [
          {
            text: translate("screens/Settings", "No"),
            style: "cancel",
          },
          {
            text: translate("screens/Settings", "Yes"),
            style: "destructive",
            onPress: async () => {
              await updateNetwork(props.network);
            },
          },
        ],
      });
    }
  };

  return (
    <ThemedTouchableListItem
      onPress={onPress}
      isLast={props.isLast}
      disabled={props.disabled}
      testID={`button_network_${props.network}`}
    >
      <ThemedTextV2
        style={tailwind("text-sm font-normal-v2")}
        testID={props.network === network ? "network_details_network" : ""}
      >
        {props.network}
      </ThemedTextV2>
      <ThemedIcon
        light={tailwind({
          "text-green-v2": props.network === network,
          "text-mono-light-v2-700 opacity-30": props.network !== network,
        })}
        dark={tailwind({
          "text-green-v2": props.network === network,
          "text-mono-dark-v2-700 opacity-30": props.network !== network,
        })}
        iconType="MaterialCommunityIcons"
        name="check-circle"
        size={20}
        testID={`button_network_${props.network}_${
          props.network === network ? "check" : "uncheck"
        }`}
      />
    </ThemedTouchableListItem>
  );
}
