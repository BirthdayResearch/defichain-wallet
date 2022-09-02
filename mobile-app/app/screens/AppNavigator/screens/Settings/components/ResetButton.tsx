import { ThemedText } from "@components/themed";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { WalletAlert } from "@components/WalletAlert";
import { TouchableOpacity } from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import { authentication, Authentication } from "@store/authentication";
import { MnemonicStorage } from "@api/wallet/mnemonic_storage";
import { useLogger } from "@shared-contexts/NativeLoggingProvider";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import { hasTxQueued } from "@store/transaction_queue";
import { hasTxQueued as hasBroadcastQueued } from "@store/ocean";
import { useServiceProviderContext } from "@contexts/StoreServiceProvider";
import { SettingsParamList } from "../SettingsNavigator";

export function ResetButton(): JSX.Element {
  const navigation = useNavigation<NavigationProp<SettingsParamList>>();
  const logger = useLogger();
  const dispatch = useAppDispatch();
  const hasPendingJob = useSelector((state: RootState) =>
    hasTxQueued(state.transactionQueue)
  );
  const hasPendingBroadcastJob = useSelector((state: RootState) =>
    hasBroadcastQueued(state.ocean)
  );
  const { url, defaultUrl, setUrl } = useServiceProviderContext();

  const isCustom = url === defaultUrl;

  const resetServiceProvider = useCallback(() => {
    // to check if user's transactions to be completed before resetting url
    if (hasPendingJob || hasPendingBroadcastJob) {
      return;
    }
    const auth: Authentication<string[]> = {
      consume: async (passphrase) => await MnemonicStorage.get(passphrase),
      onAuthenticated: async () => {
        setUrl(defaultUrl);
        navigation.goBack();
      },
      onError: (e) => logger.error(e),
      title: translate(
        "screens/ServiceProviderScreen",
        "Reset default service provider"
      ),
      message: translate(
        "screens/ServiceProviderScreen",
        "Enter passcode to continue"
      ),
      loading: translate("screens/ServiceProviderScreen", "Verifying access"),
      additionalMessage: translate("screens/ServiceProviderScreen", "Default"),
      additionalMessageUrl: defaultUrl,
    };
    dispatch(authentication.actions.prompt(auth));
  }, [dispatch, navigation]);

  // pop up box
  const onPress = async (): Promise<void> => {
    WalletAlert({
      title: translate(
        "screens/ServiceProviderScreen",
        "Reset Service Provider"
      ),
      message: translate(
        "screens/ServiceProviderScreen",
        "In doing so, you will be reverted back to Light wallet's default endpoint. Would you like to continue?"
      ),
      buttons: [
        {
          text: translate("screens/ServiceProviderScreen", "Go back"),
          style: "cancel",
        },
        {
          text: translate("screens/ServiceProviderScreen", "Reset"),
          style: "destructive",
          onPress: async () => {
            resetServiceProvider();
          },
        },
      ],
    });
  };

  return (
    <TouchableOpacity
      style={tailwind("pr-4")}
      onPress={onPress}
      disabled={isCustom}
    >
      <ThemedText
        light={tailwind(`${isCustom ? "text-gray-400" : "text-primary-500"}`)}
        dark={tailwind(`${isCustom ? "text-gray-500" : "text-primary-500"}`)}
        style={tailwind("font-medium")}
        testID="reset_button"
      >
        {translate("screens/ServiceProviderScreen", "RESET")}
      </ThemedText>
    </TouchableOpacity>
  );
}
