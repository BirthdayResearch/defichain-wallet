import {
  ThemedIcon,
  ThemedScrollViewV2,
  ThemedSectionTitleV2,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2,
} from "@components/themed";
import { Switch, View } from "@components";
import { WalletAlert } from "@components/WalletAlert";
import { usePrivacyLockContext } from "@contexts/LocalAuthContext";
import {
  useWalletPersistenceContext,
  useServiceProviderContext,
  useWalletNodeContext,
} from "@waveshq/walletkit-ui";
import { StackScreenProps } from "@react-navigation/stack";
import { authentication, Authentication } from "@store/authentication";
import { ocean } from "@waveshq/walletkit-ui/dist/store";
import { tailwind } from "@tailwind";
import { getAppLanguages, translate } from "@translations";
import { useCallback } from "react";
import { Text } from "react-native";
import { MnemonicStorage } from "@api/wallet/mnemonic_storage";
import { useLogger } from "@shared-contexts/NativeLoggingProvider";
import { useAddressBook } from "@hooks/useAddressBook";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { useFeatureFlagContext } from "@contexts/FeatureFlagContext";
import { useLanguageContext } from "@shared-contexts/LanguageProvider";
import { useCustomServiceProviderContext } from "@contexts/CustomServiceProvider";
import { RowThemeItem } from "./components/RowThemeItem";
import { SettingsParamList } from "./SettingsNavigator";

type Props = StackScreenProps<SettingsParamList, "SettingsScreen">;

export function SettingsScreen({ navigation }: Props): JSX.Element {
  const logger = useLogger();
  const dispatch = useAppDispatch();
  const walletContext = useWalletPersistenceContext();
  const localAuth = usePrivacyLockContext();
  const {
    data: { type },
  } = useWalletNodeContext();
  const isEncrypted = type === "MNEMONIC_ENCRYPTED";
  const { isCustomUrl: isCustomDvmUrl } = useServiceProviderContext();
  const { isCustomEvmUrl, isCustomEthRpcUrl } =
    useCustomServiceProviderContext();
  const { isFeatureAvailable } = useFeatureFlagContext();
  const { language } = useLanguageContext();
  const languages = getAppLanguages();

  const selectedLanguage = languages.find(
    (languageItem) => language?.startsWith(languageItem.locale),
  );

  const revealRecoveryWords = useCallback(() => {
    if (!isEncrypted) {
      return;
    }

    const auth: Authentication<string[]> = {
      consume: async (passphrase) => await MnemonicStorage.get(passphrase),
      onAuthenticated: async (words) => {
        navigation.navigate({
          name: "RecoveryWordsScreen",
          params: { words },
          merge: true,
        });
      },
      onError: (e) => logger.error(e),
      message: translate("screens/UnlockWallet", "Enter passcode to continue"),
      loading: translate(
        "screens/UnlockWallet",
        "It may take a few seconds to verify",
      ),
      title: translate(
        "screens/UnlockWallet",
        "Provide your passcode to view recovery words.",
      ),
      successMessage: translate("screens/UnlockWallet", "Passcode verified!"),
    };
    dispatch(authentication.actions.prompt(auth));
  }, [dispatch, isEncrypted, navigation]);

  const changePasscode = useCallback(() => {
    if (!isEncrypted) {
      return;
    }

    const auth: Authentication<string[]> = {
      consume: async (passphrase) => await MnemonicStorage.get(passphrase),
      onAuthenticated: async (words) => {
        navigation.navigate({
          name: "ChangePinScreen",
          params: {
            words,
            pinLength: 6,
          },
          merge: true,
        });
      },
      onError: (e) => {
        dispatch(ocean.actions.setError(e));
      },
      message: translate("screens/UnlockWallet", "Enter passcode to continue"),
      loading: translate(
        "screens/UnlockWallet",
        "It may take a few seconds to verify",
      ),
      title: translate(
        "screens/UnlockWallet",
        "Provide existing passcode to change passcode.",
      ),
      successMessage: translate("screens/UnlockWallet", "Passcode verified!"),
    };

    dispatch(authentication.actions.prompt(auth));
  }, [walletContext.wallets[0], dispatch, navigation]);

  return (
    <ThemedScrollViewV2
      contentContainerStyle={tailwind("px-5 pb-16")}
      style={tailwind("flex-1")}
      testID="setting_screen"
    >
      <ThemedSectionTitleV2
        testID="network_title"
        text={translate("screens/Settings", "GENERAL")}
      />

      <ThemedViewV2
        dark={tailwind("bg-mono-dark-v2-00")}
        light={tailwind("bg-mono-light-v2-00")}
        style={tailwind("rounded-lg-v2 pl-5 pr-4")}
      >
        <NavigateItemRow
          testID="setting_navigate_About"
          label="About"
          border
          onPress={() => navigation.navigate("AboutScreen")}
        />

        {isFeatureAvailable("service_provider") && (
          <NavigateItemRow
            testID="setting_navigate_service_provider"
            label="Provider"
            border
            value={
              isCustomDvmUrl || isCustomEvmUrl || isCustomEthRpcUrl
                ? "Custom (3rd-party)"
                : "Default"
            }
            onPress={() => navigation.navigate("ServiceProviderScreen", {})}
          />
        )}
        <NavigateItemRow
          testID="address_book_title"
          label="Address book"
          onPress={() => navigation.navigate("AddressBookScreen", {})}
        />
      </ThemedViewV2>

      {(isEncrypted || localAuth.isDeviceProtected) && (
        <>
          <ThemedSectionTitleV2
            testID="security_title"
            text={translate("screens/Settings", "SECURITY")}
          />
          <ThemedViewV2
            dark={tailwind("bg-mono-dark-v2-00")}
            light={tailwind("bg-mono-light-v2-00")}
            style={tailwind("rounded-lg-v2 pl-5 pr-4")}
          >
            {isEncrypted && (
              <>
                <NavigateItemRow
                  label="Recovery words"
                  onPress={revealRecoveryWords}
                  border
                  testID="view_recovery_words"
                />
                <NavigateItemRow
                  label="Change passcode"
                  onPress={changePasscode}
                  border={localAuth.isDeviceProtected}
                  testID="view_change_passcode"
                />
              </>
            )}
            {localAuth.isDeviceProtected && (
              <PrivacyLockToggle
                value={localAuth.isEnabled}
                onToggle={async () => {
                  await localAuth.togglePrivacyLock();
                }}
                authenticationName={localAuth.getAuthenticationNaming()}
              />
            )}
          </ThemedViewV2>
          {localAuth.isDeviceProtected && (
            <ThemedTextV2
              dark={tailwind("text-mono-dark-v2-500")}
              light={tailwind("text-mono-light-v2-500")}
              style={tailwind("px-5 pt-2 text-xs font-normal-v2")}
            >
              {translate(
                "screens/Settings",
                "Auto-locks wallet if there is no activity for 1 min.",
              )}
            </ThemedTextV2>
          )}
        </>
      )}

      <ThemedSectionTitleV2
        testID="addtional_options_title"
        text={translate("screens/Settings", "DISPLAY & LANGUAGE")}
      />
      <ThemedViewV2
        dark={tailwind("bg-mono-dark-v2-00")}
        light={tailwind("bg-mono-light-v2-00")}
        style={tailwind("rounded-lg-v2 mb-6 pl-5 pr-4")}
      >
        <RowThemeItem border />
        <NavigateItemRow
          testID="setting_navigate_language_selection"
          label="Language"
          value={selectedLanguage?.displayName}
          onPress={() => navigation.navigate("LanguageSelectionScreen")}
        />
      </ThemedViewV2>
      <RowExitWalletItem />
      <ThemedTextV2
        dark={tailwind("text-mono-dark-v2-500")}
        light={tailwind("text-mono-light-v2-500")}
        style={tailwind("px-5 pt-2 text-xs font-normal-v2 text-center")}
      >
        {translate(
          "screens/Settings",
          "This will unlink your wallet from the app.",
        )}
      </ThemedTextV2>
    </ThemedScrollViewV2>
  );
}

function RowExitWalletItem(): JSX.Element {
  const { clearWallets } = useWalletPersistenceContext();
  const { clearAddressBook } = useAddressBook();

  async function onExitWallet(): Promise<void> {
    WalletAlert({
      title: translate(
        "screens/Settings",
        "Are you sure you want to unlink your wallet?",
      ),
      message: translate(
        "screens/Settings",
        "Once unlinked, you will need to enter your recovery words to restore your wallet.",
      ),
      buttons: [
        {
          text: translate("screens/Settings", "Cancel"),
          style: "cancel",
        },
        {
          text: translate("screens/Settings", "Unlink wallet"),
          onPress: async () => {
            clearAddressBook();
            await clearWallets();
          },
          style: "destructive",
        },
      ],
    });
  }

  return (
    <ThemedTouchableOpacityV2
      light={tailwind("bg-mono-light-v2-00")}
      dark={tailwind("bg-mono-dark-v2-00")}
      style={tailwind("border-0 p-4.5 flex-row justify-center rounded-lg-v2")}
      onPress={onExitWallet}
      testID="setting_exit_wallet"
    >
      <Text style={tailwind("font-normal-v2 text-sm text-red-v2")}>
        {translate("screens/Settings", "Unlink wallet")}
      </Text>
    </ThemedTouchableOpacityV2>
  );
}

function PrivacyLockToggle({
  value,
  onToggle,
  authenticationName,
}: {
  // eslint-disable-next-line react/no-unused-prop-types
  disabled?: boolean;
  value: boolean;
  onToggle: (newValue: boolean) => void;
  authenticationName?: string;
}): JSX.Element {
  return (
    <View style={tailwind("flex py-4.5 flex-row items-center justify-between")}>
      <ThemedTextV2
        light={tailwind("text-mono-light-v2-900")}
        dark={tailwind("text-mono-dark-v2-900")}
        style={tailwind("font-normal-v2 text-sm flex-1")}
        testID="text_privacy_lock"
      >
        {authenticationName !== undefined &&
          translate("screens/Settings", "Secure with {{option}}", {
            option: translate("screens/Settings", authenticationName),
          })}
      </ThemedTextV2>
      <Switch
        onValueChange={onToggle}
        value={value}
        testID="switch_privacy_lock"
      />
    </View>
  );
}

interface INavigateItemRow {
  testID: string;
  label: string;
  value?: string;
  onPress: () => void;
  border?: boolean;
}

function NavigateItemRow({
  testID,
  label,
  value,
  onPress,
  border,
}: INavigateItemRow): JSX.Element {
  return (
    <ThemedViewV2
      style={tailwind({ "border-b-0.5": border })}
      light={tailwind("border-mono-light-v2-300")}
      dark={tailwind("border-mono-dark-v2-300")}
    >
      <ThemedTouchableOpacityV2
        onPress={onPress}
        style={tailwind(
          "flex py-4.5 flex-row items-center justify-between border-0",
        )}
        testID={testID}
      >
        <ThemedTextV2
          light={tailwind("text-mono-light-v2-900")}
          dark={tailwind("text-mono-dark-v2-900")}
          style={tailwind("font-normal-v2 text-sm")}
        >
          {translate("screens/Settings", label)}
        </ThemedTextV2>

        <View style={tailwind("flex flex-row items-center")}>
          {value !== undefined && (
            <ThemedTextV2
              light={tailwind("text-mono-light-v2-700")}
              dark={tailwind("text-mono-dark-v2-700")}
              style={tailwind("font-normal-v2 text-sm mr-1")}
              testID={`${testID}_value`}
            >
              {translate("screens/Settings", value)}
            </ThemedTextV2>
          )}
          <ThemedIcon
            dark={tailwind("text-mono-dark-v2-900")}
            light={tailwind("text-mono-light-v2-900")}
            iconType="Feather"
            name="chevron-right"
            size={24}
          />
        </View>
      </ThemedTouchableOpacityV2>
    </ThemedViewV2>
  );
}
