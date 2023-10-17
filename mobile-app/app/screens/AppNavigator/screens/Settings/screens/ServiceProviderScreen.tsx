import { useCallback, useState } from "react";
import { Dimensions, Platform, Text, View } from "react-native";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { ThemedScrollViewV2 } from "@components/themed";
import { ButtonV2 } from "@components/ButtonV2";
import { authentication, Authentication } from "@store/authentication";
import { MnemonicStorage } from "@api/wallet/mnemonic_storage";
import { StackScreenProps } from "@react-navigation/stack";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { useLogger } from "@shared-contexts/NativeLoggingProvider";
import {
  useServiceProviderContext,
  useWalletNodeContext,
} from "@waveshq/walletkit-ui";
import {
  CustomServiceProviderType,
  useCustomServiceProviderContext,
} from "@contexts/CustomServiceProvider";
import { useDomainContext } from "@contexts/DomainContext";
import { SettingsParamList } from "../SettingsNavigator";
import { ResetButton } from "../components/ResetButton";
import {
  CustomServiceProvider,
  CustomUrlInput,
} from "../components/CustomUrlInput";

type Props = StackScreenProps<SettingsParamList, "ServiceProviderScreen">;
type CustomUrlInputState = {
  [key in CustomServiceProviderType]: {
    url: string;
    isValid: boolean;
  };
};

export function ServiceProviderScreen({ navigation }: Props): JSX.Element {
  const { isEvmFeatureEnabled } = useDomainContext();
  const logger = useLogger();
  const dispatch = useAppDispatch();
  // show all content for small screen and web to adjust margins and paddings
  const isSmallScreen =
    Platform.OS === "web" || Dimensions.get("window").height <= 667;

  // get all default urls from context
  const {
    url: dvmUrl,
    defaultUrl: defaultDvmUrl,
    setUrl: setDvmUrl,
  } = useServiceProviderContext();
  const { evmUrl, ethRpcUrl, defaultEvmUrl, defaultEthRpcUrl, setCustomUrl } =
    useCustomServiceProviderContext();

  const [urlInputValues, setUrlInputValues] = useState<CustomUrlInputState>({
    dvm: { url: dvmUrl, isValid: true },
    evm: { url: evmUrl, isValid: true },
    ethrpc: { url: ethRpcUrl, isValid: true },
  });
  const [activeInput, setActiveInput] = useState<CustomServiceProviderType>();
  const [showActionButtons, setShowActionButtons] = useState<boolean>(false);

  const customProviders: CustomServiceProvider[] = [
    {
      type: "dvm",
      url: dvmUrl,
      defaultUrl: defaultDvmUrl,
      label: "ENDPOINT URL (DVM)",
      helperText: "Used to get balance from Native DFC (MainNet and TestNet)",
    },
    {
      type: "evm",
      url: evmUrl,
      defaultUrl: defaultEvmUrl,
      label: "ENDPOINT URL (EVM)",
      helperText: "Used to get balance from EVM (MainNet and TestNet)",
    },
    {
      type: "ethrpc",
      url: ethRpcUrl,
      defaultUrl: defaultEthRpcUrl,
      label: "ENDPOINT URL (ETH-RPC)",
      helperText: "Used to get Nonce and Chain ID",
    },
  ];

  // Check customized urls
  const getCustomizedUrls = () => {
    const changedUrls: string[] = [];
    const { dvm, evm, ethrpc } = urlInputValues;
    if (dvm.url !== defaultDvmUrl) {
      changedUrls.push(dvm.url);
    }
    if (evm.url !== defaultEvmUrl) {
      changedUrls.push(evm.url);
    }
    if (ethrpc.url !== defaultEthRpcUrl) {
      changedUrls.push(ethrpc.url);
    }
    return changedUrls;
  };

  // Passcode prompt
  const {
    data: { type: encryptionType },
  } = useWalletNodeContext();
  const isEncrypted = encryptionType === "MNEMONIC_ENCRYPTED";
  const submitCustomServiceProvider = useCallback(async (): Promise<void> => {
    if (!isEncrypted) {
      return;
    }

    const customUrls = getCustomizedUrls().join(" and ");
    const auth: Authentication<string[]> = {
      consume: async (passphrase) => await MnemonicStorage.get(passphrase),
      onAuthenticated: async () => {
        const { dvm, evm, ethrpc } = urlInputValues;
        await Promise.all([
          setDvmUrl(dvm.url),
          ...(isEvmFeatureEnabled
            ? [setCustomUrl(evm.url, "evm"), setCustomUrl(ethrpc.url, "ethrpc")]
            : []),
        ]);
        navigation.pop();
      },
      onError: (e) => logger.error(e),
      title: `${translate(
        "screens/ServiceProviderScreen",
        "Adding custom service providers",
      )} ${customUrls}`,
      message: translate(
        "screens/ServiceProviderScreen",
        "Enter passcode to continue",
      ),
      loading: translate("screens/ServiceProviderScreen", "Verifying access"),
      additionalMessage: translate("screens/ServiceProviderScreen", "Custom"),
      additionalMessageUrl: customUrls,
    };
    dispatch(authentication.actions.prompt(auth));
  }, [dispatch, isEncrypted, navigation, urlInputValues]);

  const validateInputlabel = (input: string): boolean => {
    // TODO: Only allow `https` url
    if (input === "" || !/^http/.test(input)) {
      return false;
    }
    return true;
  };

  const handleUrlInputChange = (
    type: CustomServiceProviderType,
    value: string,
  ) => {
    const updatedInputValues = {
      ...urlInputValues,
      [type]: {
        ...urlInputValues[type],
        url: value,
        isValid: validateInputlabel(value),
      },
    };
    setUrlInputValues(updatedInputValues);
  };

  return (
    <ThemedScrollViewV2
      contentContainerStyle={tailwind("px-5 pb-16")}
      style={tailwind("flex-1")}
    >
      <View>
        {customProviders.map((provider) => (
          <CustomUrlInput
            {...provider}
            inputValue={urlInputValues[provider.type]}
            activeInput={activeInput}
            setActiveInput={setActiveInput}
            setShowActionButtons={setShowActionButtons}
            handleUrlInputChange={handleUrlInputChange}
            isDisabled={
              !isEvmFeatureEnabled && ["evm", "ethrpc"].includes(provider.type)
            }
          />
        ))}
      </View>
      {showActionButtons && (
        <View style={tailwind("mt-48", { "mt-36": isSmallScreen })}>
          <View style={tailwind("mt-2 px-5 mb-5")}>
            <Text
              style={tailwind(
                "text-orange-v2 font-normal-v2 text-xs text-center",
              )}
            >
              {translate(
                "screens/ServiceProviderScreen",
                "Only add URLs that are fully trusted and secured. Adding malicious service providers may result in irrecoverable funds. Proceed at your own risk.",
              )}
            </Text>
          </View>
          <ButtonV2
            styleProps="mx-7 mt-2"
            label={translate("screens/ServiceProviderScreen", "Continue")}
            testID="button_submit"
            onPress={async () => await submitCustomServiceProvider()}
            disabled={
              !(
                urlInputValues.dvm.isValid &&
                urlInputValues.evm.isValid &&
                urlInputValues.ethrpc.isValid
              )
            }
          />
          <ResetButton />
        </View>
      )}
    </ThemedScrollViewV2>
  );
}
