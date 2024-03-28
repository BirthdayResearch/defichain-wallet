import {
  LinkingOptions,
  NavigationContainer,
  NavigationContainerRef,
} from "@react-navigation/native";
import { Theme } from "@react-navigation/native/lib/typescript/src/types";
import { createStackNavigator } from "@react-navigation/stack";
import { tailwind } from "@tailwind";
import * as Linking from "expo-linking";
import { useRef } from "react";
import { useThemeContext, WalletPersistenceDataI } from "@waveshq/walletkit-ui";
import { translate } from "@translations";
import { HeaderNetworkStatus } from "@components/HeaderNetworkStatus";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getDefaultTheme } from "@constants/Theme";
import { PinCreation } from "@screens/WalletNavigator/screens/CreateWallet/PinCreation";
import { PinConfirmation } from "@screens/WalletNavigator/screens/CreateWallet/PinConfirmation";
import { Onboarding } from "@screens/WalletNavigator/screens/Onboarding";
import { EncryptedProviderData } from "@defichain/jellyfish-wallet-encrypted";
import { Dimensions, Platform } from "react-native";
import { BackIcon } from "@components/icons/BackIcon";
import { OnboardingNetworkSelectScreen } from "./screens/CreateWallet/OnboardingNetworkSelectScreen";
import { RecoveryWordsFaq } from "./screens/CreateWallet/RecoveryWordsFaq";
import { PasscodeFaq } from "./screens/CreateWallet/PasscodeFaq";
import { WalletCreateRestoreSuccess } from "./screens/CreateWallet/WalletCreateRestoreSuccess";
import { RestoreMnemonicWallet } from "./screens/RestoreWallet/RestoreMnemonicWallet";
import { VerifyMnemonicWallet } from "./screens/CreateWallet/VerifyMnemonicWallet";
import { CreateWalletGuidelines } from "./screens/CreateWallet/CreateWalletGuidelines";
import { CreateMnemonicWallet } from "././screens/CreateWallet/CreateMnemonicWallet";

type PinCreationType = "create" | "restore";

export interface WalletParamList {
  VerifyMnemonicWallet: {
    words: string[];
  };
  WalletCreateRestoreSuccess: {
    isWalletRestored: boolean;
    data: WalletPersistenceDataI<EncryptedProviderData>;
  };
  PinCreation: {
    pinLength: 4 | 6;
    words: string[];
    type: PinCreationType;
  };
  PinConfirmation: {
    pin: string;
    words: string[];
    type: PinCreationType;
  };

  [key: string]: undefined | object;
}

const WalletStack = createStackNavigator<WalletParamList>();

const LinkingConfiguration: LinkingOptions<ReactNavigation.RootParamList> = {
  prefixes: [Linking.createURL("/")],
  config: {
    screens: {
      Onboarding: "wallet/onboarding",
      OnboardingNetworkSelectScreen: "wallet/mnemonic/network",
      CreateMnemonicWallet: "wallet/mnemonic/create",
      CreateWalletGuidelines: "wallet/onboarding/guidelines",
      RecoveryWordsFaq: "wallet/onboarding/guidelines/recovery",
      VerifyMnemonicWallet: "wallet/mnemonic/create/verify",
      RestoreMnemonicWallet: "wallet/mnemonic/restore",
      PinCreation: "wallet/pin/create",
      PinConfirmation: "wallet/pin/confirm",
      PasscodeFaq: "wallet/pin/faq",
    },
  },
};

export function WalletNavigator(): JSX.Element {
  const { isLight } = useThemeContext();
  const navigationRef =
    useRef<NavigationContainerRef<ReactNavigation.RootParamList>>(null);
  const DeFiChainTheme: Theme = getDefaultTheme(isLight);
  const insets = useSafeAreaInsets();

  const goToNetworkSelect = (): void => {
    // TODO(kyleleow) update typings
    // @ts-expect-error
    navigationRef.current?.navigate({ name: "OnboardingNetworkSelectScreen" });
  };

  function WalletStacks(): JSX.Element {
    const { width } = Dimensions.get("window");

    return (
      <WalletStack.Navigator
        initialRouteName="Onboarding"
        screenOptions={{
          headerTitleStyle: tailwind("font-normal-v2 text-xl text-center"),
          headerTitleContainerStyle: {
            width: width - (Platform.OS === "ios" ? 200 : 180),
          },
          headerBackImage: BackIcon,
          headerTitleAlign: "center",
          headerBackTitleVisible: false,
          headerRightContainerStyle: tailwind("pr-5 pb-2"),
          headerLeftContainerStyle: tailwind("pl-5 relative", {
            "right-2": Platform.OS === "ios",
            "right-5": Platform.OS !== "ios",
          }),
          headerStyle: [
            tailwind("rounded-b-2xl border-b", {
              "bg-mono-light-v2-00 border-mono-light-v2-100": isLight,
              "bg-mono-dark-v2-00 border-mono-dark-v2-100": !isLight,
            }),
            { height: 76 + insets.top },
          ],
          headerBackgroundContainerStyle: tailwind({
            "bg-mono-light-v2-100": isLight,
            "bg-mono-dark-v2-100": !isLight,
          }),
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
        }}
      >
        <WalletStack.Screen
          component={Onboarding}
          name="Onboarding"
          options={{
            headerShown: false,
          }}
        />

        <WalletStack.Screen
          component={CreateWalletGuidelines}
          name="CreateWalletGuidelines"
          options={{
            headerTitle: translate("screens/WalletNavigator", "New Wallet"),
          }}
        />

        <WalletStack.Screen
          component={CreateMnemonicWallet}
          name="CreateMnemonicWallet"
          options={{
            headerTitle: translate(
              "screens/WalletNavigator",
              "View Recovery Words",
            ),
            headerRight: undefined,
          }}
        />

        <WalletStack.Screen
          component={VerifyMnemonicWallet}
          name="VerifyMnemonicWallet"
          options={{
            headerTitle: translate("screens/WalletNavigator", "Verify Words"),
            headerRight: undefined,
          }}
        />

        <WalletStack.Screen
          component={RestoreMnemonicWallet}
          name="RestoreMnemonicWallet"
          options={{
            headerTitle: translate("screens/WalletNavigator", "Restore Wallet"),
          }}
        />

        <WalletStack.Screen
          component={WalletCreateRestoreSuccess}
          name="WalletCreateRestoreSuccess"
          options={{
            headerShown: false,
          }}
        />

        <WalletStack.Screen
          component={OnboardingNetworkSelectScreen}
          name="OnboardingNetworkSelectScreen"
          options={{
            headerTitle: translate("screens/NetworkDetails", "Network"),
            headerRight: undefined,
          }}
        />

        <WalletStack.Screen
          component={RecoveryWordsFaq}
          name="RecoveryWordsFaq"
          options={{
            headerTitle: translate(
              "screens/WalletNavigator",
              "About Recovery Words",
            ),
            headerRight: undefined,
          }}
        />

        <WalletStack.Screen
          component={PasscodeFaq}
          name="PasscodeFaq"
          options={{
            headerTitle: translate("screens/WalletNavigator", "About Passcode"),
            headerRight: undefined,
          }}
        />

        <WalletStack.Screen
          component={PinCreation}
          name="PinCreation"
          options={{
            headerTitle: translate(
              "screens/WalletNavigator",
              "Create Passcode",
            ),
            headerRight: undefined,
          }}
        />
        <WalletStack.Screen
          component={PinConfirmation}
          name="PinConfirmation"
          options={{
            headerTitle: translate(
              "screens/WalletNavigator",
              "Verify Passcode",
            ),
            headerRight: undefined,
          }}
        />
      </WalletStack.Navigator>
    );
  }

  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      ref={navigationRef}
      theme={DeFiChainTheme}
    >
      <WalletStacks />
    </NavigationContainer>
  );
}
