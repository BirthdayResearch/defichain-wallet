import { useNetInfo, fetch } from "@react-native-community/netinfo";
import { View, Image } from "react-native";
import ImageConnectionProblem from "@assets/images/misc/connection_problem.png";
import { ThemedIcon, ThemedTextV2, ThemedViewV2 } from "@components/themed";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { ButtonV2 } from "@components/ButtonV2";

export default function ConnectionBoundary(
  props: React.PropsWithChildren<any>
): JSX.Element | null {
  const netInfo = useNetInfo();
  const noConnection = (): boolean => {
    return netInfo.isConnected === true;
  };

  return noConnection() ? <ConnectionErrorComponent /> : props.children;
}

function ConnectionErrorComponent(): JSX.Element {
  const checkConnectivity = (): void => {
    void fetch();
  };
  return (
    <ThemedViewV2
      style={tailwind("flex-1 items-center justify-center px-8")}
      testID="connection_error"
    >
      <View style={tailwind("items-center justify-center px-15 pb-8")}>
        <Image
          source={ImageConnectionProblem}
          style={{ width: 163, height: 59 }}
        />
      </View>

      <ThemedTextV2
        style={tailwind("text-xl pb-2 font-semibold-v2 text-center")}
      >
        {translate("screens/ConnectionBoundary", "Connection problems")}
      </ThemedTextV2>

      <ThemedTextV2
        style={tailwind("pb-12 font-normal-v2 text-center opacity-60")}
      >
        {translate(
          "screens/ConnectionBoundary",
          "There seems to be a problem with the connection. Check your network and try again."
        )}
      </ThemedTextV2>

      <ButtonV2
        label={translate("screens/ConnectionBoundary", "Refresh")}
        onPress={checkConnectivity}
        testID="button_check_connectivity"
        styleProps="m-0 mb-4 w-48"
      />
    </ThemedViewV2>
  );
}
