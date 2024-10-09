import { translate } from "@translations";
import { WalletAlert } from "@components/WalletAlert";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import React, { useCallback } from "react";
import { authentication, Authentication } from "@store/authentication";
import { MnemonicStorage } from "@api/wallet/mnemonic_storage";
import { useLogger } from "@shared-contexts/NativeLoggingProvider";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import { hasTxQueued, hasOceanTXQueued } from "@waveshq/walletkit-ui/store";
import { useServiceProviderContext } from "@waveshq/walletkit-ui";
import { ButtonV2 } from "@components/ButtonV2";
import {
  CustomServiceProviderType,
  useCustomServiceProviderContext,
} from "@contexts/CustomServiceProvider";
import { useDomainContext } from "@contexts/DomainContext";
import { SettingsParamList } from "../SettingsNavigator";

export function ResetButton(): JSX.Element {
  const { isEvmFeatureEnabled } = useDomainContext();
  const navigation = useNavigation<NavigationProp<SettingsParamList>>();
  const logger = useLogger();
  const dispatch = useAppDispatch();
  const hasPendingJob = useSelector((state: RootState) =>
    hasTxQueued(state.transactionQueue),
  );
  const hasPendingBroadcastJob = useSelector((state: RootState) =>
    hasOceanTXQueued(state.ocean),
  );
  const {
    url: dvmUrl,
    defaultUrl: defaultDvmUrl,
    setUrl: setDvmUrl,
  } = useServiceProviderContext();
  const { evmUrl, ethRpcUrl, defaultEvmUrl, defaultEthRpcUrl, setCustomUrl } =
    useCustomServiceProviderContext();

  const isDisabled =
    dvmUrl === defaultDvmUrl &&
    evmUrl === defaultEvmUrl &&
    ethRpcUrl === defaultEthRpcUrl;

  const resetServiceProvider = useCallback(() => {
    // to check if user's transactions to be completed before resetting url
    if (hasPendingJob || hasPendingBroadcastJob) {
      return;
    }
    const auth: Authentication<string[]> = {
      consume: async (passphrase) => await MnemonicStorage.get(passphrase),
      onAuthenticated: async () => {
        await Promise.all([
          setDvmUrl(defaultDvmUrl),
          ...(isEvmFeatureEnabled
            ? [
                setCustomUrl(defaultEvmUrl, CustomServiceProviderType.EVM),
                setCustomUrl(
                  defaultEthRpcUrl,
                  CustomServiceProviderType.ETHRPC,
                ),
              ]
            : []),
        ]);
        navigation.goBack();
      },
      onError: (e) => logger.error(e),
      title: translate(
        "screens/ServiceProviderScreen",
        "Reset default service provider",
      ),
      message: translate(
        "screens/ServiceProviderScreen",
        "Enter passcode to continue",
      ),
      loading: translate("screens/ServiceProviderScreen", "Verifying access"),
      additionalMessage: translate("screens/ServiceProviderScreen", "Default"),
      additionalMessageUrl: [
        defaultDvmUrl,
        defaultEvmUrl,
        defaultEthRpcUrl,
      ].join(" and "),
    };
    dispatch(authentication.actions.prompt(auth));
  }, [dispatch, navigation]);

  // pop up box
  const onPress = async (): Promise<void> => {
    WalletAlert({
      title: translate(
        "screens/ServiceProviderScreen",
        "Reset Service Provider",
      ),
      message: translate(
        "screens/ServiceProviderScreen",
        "In doing so, you will be reverted back to Light wallet's default endpoint. Would you like to continue?",
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
    <ButtonV2
      disabled={isDisabled}
      fillType="flat"
      label={translate("screens/ServiceProviderScreen", "Reset providers")}
      styleProps="mt-3"
      onPress={onPress}
      testID="reset_button"
    />
  );
}
