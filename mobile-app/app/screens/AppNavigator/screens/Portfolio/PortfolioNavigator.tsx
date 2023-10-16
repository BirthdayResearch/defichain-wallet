import { NavigationProp, useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AddressType, WalletToken } from "@waveshq/walletkit-ui/dist/store";
import BigNumber from "bignumber.js";
import { Image } from "expo-image";
import { Platform, View } from "react-native";
import { DomainSwitch } from "@components/DomainSwitch";
import { BarCodeScanner } from "@components/BarCodeScanner";
import { HeaderTitle } from "@components/HeaderTitle";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { LocalAddress, WhitelistedAddress } from "@store/userPreferences";
import { FutureSwapData } from "@store/futureSwap";
import { TransactionsScreen } from "@screens/AppNavigator/screens/Transactions/TransactionsScreen";
import { TransactionDetailScreen } from "@screens/AppNavigator/screens/Transactions/screens/TransactionDetailScreen";
import { VMTransaction } from "@screens/AppNavigator/screens/Transactions/screens/stateProcessor";
import { useNavigatorScreenOptions } from "@hooks/useNavigatorScreenOptions";
import { useThemeContext } from "@waveshq/walletkit-ui";
import GridBackgroundImageLight from "@assets/images/onboarding/grid-background-light.png";
import GridBackgroundImageDark from "@assets/images/onboarding/grid-background-dark.png";
import { HeaderNetworkStatus } from "@components/HeaderNetworkStatus";
import { ConvertScreen } from "@screens/AppNavigator/screens/Portfolio/screens/ConvertScreen";
import { ConvertConfirmationScreen } from "@screens/AppNavigator/screens/Portfolio/screens/ConvertConfirmationScreen";
import { FutureSwapScreen } from "@screens/AppNavigator/screens/Portfolio/screens/FutureSwapScreen";
import { WithdrawFutureSwapScreen } from "@screens/AppNavigator/screens/Portfolio/screens/WithdrawFutureSwapScreen";
import { ConfirmWithdrawFutureSwapScreen } from "@screens/AppNavigator/screens/Portfolio/screens/ConfirmWithdrawFutureSwapScreen";
import {
  SelectionToken,
  SwapTokenSelectionScreen,
  TokenListType,
} from "@screens/AppNavigator/screens/Dex/CompositeSwap/SwapTokenSelectionScreen";
import { ConvertDirection, ScreenName } from "@screens/enum";
import { DomainType, useDomainContext } from "@contexts/DomainContext";
import { NetworkDetails } from "../Settings/screens/NetworkDetails";
import { PortfolioScreen } from "./PortfolioScreen";
import { ReceiveScreen } from "./screens/ReceiveScreen";
import { AddressControlScreen } from "./components/AddressControlScreen";
import { AboutScreen } from "../Settings/screens/AboutScreen";
import { RemoveLiquidityScreen } from "../Dex/DexRemoveLiquidity";
import { RemoveLiquidityConfirmScreen } from "../Dex/DexConfirmRemoveLiquidity";
import { GetDFIScreen } from "./screens/GetDFIScreen";
import { MarketplaceScreen } from "./screens/MarketplaceScreen";
import { SettingsNavigator } from "../Settings/SettingsNavigator";
import { HeaderSettingButton } from "./components/HeaderSettingButton";
import { TokenDetailScreen } from "./screens/TokenDetailScreen";
import { AddressBookScreen } from "./screens/AddressBookScreen";
import { AddOrEditAddressBookScreen } from "./screens/AddOrEditAddressBookScreen";
import { TokensVsUtxoFaq } from "./screens/TokensVsUtxoFaq";
import { SendScreen } from "./screens/SendScreen";
import { TokenSelectionScreen } from "./screens/TokenSelectionScreen";
import { SendConfirmationScreen } from "./screens/SendConfirmationScreen";
import { NetworkSelectionScreen } from "../Settings/screens/NetworkSelectionScreen";
import { AddLiquidityScreen } from "../Dex/DexAddLiquidity";
import { ConfirmAddLiquidityScreen } from "../Dex/DexConfirmAddLiquidity";
import { CompositeSwapScreen } from "../Dex/CompositeSwap/CompositeSwapScreen";
import { ConfirmCompositeSwapScreen } from "../Dex/CompositeSwap/ConfirmCompositeSwapScreen";
import {
  OCGProposalsScreen,
  OCGProposalType,
} from "./screens/OCG/OCGProposalsScreen";
import { CFPDetailScreen } from "./screens/OCG/CFPDetailScreen";
import { DFIPDetailScreen } from "./screens/OCG/DFIPDetailScreen";
import { OCGConfirmScreen } from "./screens/OCG/OCGConfirmScreen";
import { DomainToken } from "./hooks/TokenBalance";

export interface PortfolioParamList {
  PortfolioScreen: undefined;
  ReceiveScreen: undefined;
  MarketplaceScreen: undefined;
  SendScreen: { token?: WalletToken };
  SendConfirmationScreen: {
    token: WalletToken;
    destination: string;
    amount: BigNumber;
    amountInUsd: BigNumber;
    fee: BigNumber;
    conversion?: ConversionParam;
    toAddressLabel?: string;
    addressType?: AddressType;
    originScreen?: ScreenName;
    matchedAddress?: WhitelistedAddress | LocalAddress;
  };
  TokenDetailScreen: { token: WalletToken };
  ConvertScreen: {
    sourceToken: DomainToken;
    targetToken?: DomainToken;
    convertDirection: ConvertDirection;
  };
  ConvertConfirmationScreen: {
    amount: BigNumber;
    convertDirection: ConvertDirection;
    fee: BigNumber;
    originScreen: ScreenName;
    sourceToken: {
      tokenId: string;
      displaySymbol: string;
      balance: BigNumber;
      displayTextSymbol: string;
    };
    targetToken: {
      tokenId: string;
      displaySymbol: string;
      balance: BigNumber;
      displayTextSymbol: string;
    };
  };
  BarCodeScanner: {
    onQrScanned: (value: string) => void;
    title?: string;
  };
  TokenVsUtxoScreen: undefined;
  AddressBookScreen: {
    selectedAddress?: string;
    onAddressSelect?: (address: string) => void;
  };
  AddOrEditAddressBookScreen: {
    title: string;
    onSaveButtonPress: (address?: string) => void;
    addressLabel?: WhitelistedAddress;
    addressDomainType?: DomainType;
    address?: string;
    isAddNew: boolean;
  };
  FutureSwapScreen: undefined;
  FutureSwapDetailScreen: {
    futureSwap: FutureSwapData;
    executionBlock: number;
  };
  WithdrawFutureSwapScreen: {
    futureSwap: FutureSwapData;
    executionBlock: number;
  };
  ConfirmWithdrawFutureSwapScreen: {
    source: {
      amountToWithdraw: BigNumber;
      remainingAmount: BigNumber;
      remainingAmountInUSD: BigNumber;
      tokenId: string;
      displaySymbol: string;
      isLoanToken: boolean;
      symbol: string;
    };
    destination: {
      tokenId: string;
      displaySymbol: string;
    };
    fee: BigNumber;
    executionBlock: number;
  };
  TransactionsScreen: undefined;
  TransactionDetailScreen: {
    tx: VMTransaction;
  };
  GetDFIScreen: undefined;
  SwapTokenSelectionScreen: {
    fromToken: {
      symbol?: string;
      displaySymbol?: string;
    };
    listType: TokenListType;
    list: any;
    onTokenPress: (item: SelectionToken) => void;
    isConvert?: boolean;
    isFutureSwap?: boolean;
    isSearchDTokensOnly?: boolean;
  };
  OCGConfirmScreen: {
    type: OCGProposalType;
    fee: BigNumber;
    proposalFee: BigNumber;
    url: string;
    title: string;
    amountRequest?: BigNumber;
    cycle?: number;
    receivingAddress?: string;
    conversion?: ConversionParam;
  };

  [key: string]: undefined | object;
}

export interface ConversionParam {
  isConversionRequired: boolean;
  isConverted?: boolean;
  conversionAmount: BigNumber;
  DFIUtxo: WalletToken;
  DFIToken: WalletToken;
}

const PortfolioStack = createStackNavigator<PortfolioParamList>();

export function PortfolioNavigator(): JSX.Element {
  const navigation = useNavigation<NavigationProp<PortfolioParamList>>();
  const { isLight } = useThemeContext();
  const { isEvmFeatureEnabled } = useDomainContext();
  const goToNetworkSelect = (): void => {
    navigation.navigate("NetworkSelectionScreenPortfolio");
  };
  const screenOptions = useNavigatorScreenOptions();
  return (
    <PortfolioStack.Navigator
      initialRouteName="PortfolioScreen"
      screenOptions={{
        headerTitleAlign: "center",
      }}
    >
      <PortfolioStack.Screen
        component={SettingsNavigator}
        name={translate("PortfolioNavigator", "Settings")}
        options={{
          headerShown: false,
        }}
      />

      <PortfolioStack.Screen
        component={PortfolioScreen}
        name="PortfolioScreen"
        options={{
          ...screenOptions,
          headerBackgroundContainerStyle: tailwind("overflow-hidden", {
            "bg-mono-light-v2-00": isLight,
            "bg-mono-dark-v2-00": !isLight,
          }),
          headerBackground: () => (
            <Image
              source={
                isLight ? GridBackgroundImageLight : GridBackgroundImageDark
              }
              // eslint-disable-next-line react-native/no-inline-styles
              style={{
                height: 220,
                width: "100%",
              }}
              contentFit="cover"
            />
          ),
          headerLeft: () => (
            <View
              style={tailwind(
                "flex flex-row bg-transparent items-center w-full",
              )}
            >
              {isEvmFeatureEnabled && <DomainSwitch testID="domain_switch" />}

              <HeaderSettingButton />
            </View>
          ),
          headerLeftContainerStyle: tailwind("pl-5", {
            "pb-2": Platform.OS === "ios",
            "pb-1.5": Platform.OS !== "ios",
          }),
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerTitle: () => <></>,
        }}
      />

      <PortfolioStack.Screen
        component={ReceiveScreen}
        name="Receive"
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerTitle: translate("screens/ReceiveScreen", "Receive"),
        }}
      />

      <PortfolioStack.Screen
        component={AddressControlScreen}
        name="AddressControlScreen"
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate("screens/AddressControlScreen", "Wallet Address")}
            />
          ),
          headerRightContainerStyle: tailwind("px-2 py-2"),
          headerBackTitleVisible: false,
        }}
      />

      <PortfolioStack.Screen
        component={GetDFIScreen}
        name="GetDFIScreen"
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerBackTitleVisible: false,
          headerTitle: translate("screens/ReceiveScreen", "Get DFI"),
        }}
      />

      <PortfolioStack.Screen
        component={MarketplaceScreen}
        name="MarketplaceScreen"
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerBackTitleVisible: false,
          headerTitle: translate("screens/MarketplaceScreen", "Marketplace"),
        }}
      />

      <PortfolioStack.Screen
        component={SendScreen}
        name="SendScreen"
        options={{
          ...screenOptions,
          headerTitle: translate("screens/SendScreen", "Send"),
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerBackTitleVisible: false,
        }}
      />

      <PortfolioStack.Screen
        component={TokenSelectionScreen}
        name="TokenSelectionScreen"
        options={{
          ...screenOptions,
          headerTitle: translate("screens/SendScreen", "Send"),
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerBackTitleVisible: false,
        }}
      />

      <PortfolioStack.Screen
        component={SendConfirmationScreen}
        name="SendConfirmationScreen"
        options={{
          ...screenOptions,
          headerTitle: translate("screens/SendConfirmationScreen", "Confirm"),
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerBackTitleVisible: false,
        }}
      />

      <PortfolioStack.Screen
        component={TokenDetailScreen}
        name="TokenDetailScreen"
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerTitle: translate("screens/TokenDetailScreen", "Balance"),
        }}
      />

      <PortfolioStack.Screen
        component={ConvertScreen}
        name="ConvertScreen"
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerTitle: translate("screens/ConvertScreen", "Convert"),
        }}
      />

      <PortfolioStack.Screen
        component={ConvertConfirmationScreen}
        name="ConvertConfirmationScreen"
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerTitle: translate("screens/ConvertConfirmScreen", "Confirm"),
        }}
      />

      <PortfolioStack.Screen
        component={BarCodeScanner}
        name="BarCodeScanner"
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerTitle: translate("screens/ConvertScreen", "Scan recipient QR"),
        }}
      />

      <PortfolioStack.Screen
        component={TokensVsUtxoFaq}
        name="TokensVsUtxo"
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate("screens/ConvertScreen", "UTXO vs Token")}
            />
          ),
          headerBackTitleVisible: false,
        }}
      />

      <PortfolioStack.Screen
        component={NetworkDetails}
        name="NetworkDetails"
        options={{
          headerTitle: translate("screens/NetworkDetails", "Wallet Network"),
          headerBackTitleVisible: false,
          headerBackTestID: "network_details_header_back",
        }}
      />

      <PortfolioStack.Screen
        component={NetworkSelectionScreen}
        name="NetworkSelectionScreenPortfolio"
        options={{
          ...screenOptions,
          headerTitle: translate("screens/NetworkSelectionScreen", "Network"),
          headerBackTitleVisible: false,
          headerRight: undefined,
        }}
      />

      <PortfolioStack.Screen
        component={AboutScreen}
        name="AboutScreen"
        options={{
          headerTitle: () => (
            <HeaderTitle text={translate("screens/AboutScreen", "About")} />
          ),
          headerBackTitleVisible: false,
        }}
      />

      <PortfolioStack.Screen
        component={CompositeSwapScreen as any}
        name="CompositeSwap"
        options={{
          ...screenOptions,
          headerTitle: translate("screens/DexScreen", "Swap"),
          headerStyle: [
            screenOptions.headerStyle,
            tailwind("rounded-b-none border-b-0"),
            {
              shadowOpacity: 0,
            },
          ],
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
        }}
      />

      <PortfolioStack.Screen
        component={SwapTokenSelectionScreen}
        name="SwapTokenSelectionScreen"
        options={{
          ...screenOptions,
          headerTitle: translate("screens/SwapTokenSelectionScreen", "Select"),
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
        }}
      />

      <PortfolioStack.Screen
        component={ConfirmCompositeSwapScreen as any}
        name="ConfirmCompositeSwapScreen"
        options={{
          ...screenOptions,
          headerTitle: translate("screens/DexScreen", "Confirm"),
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
        }}
      />

      <PortfolioStack.Screen
        component={AddressBookScreen}
        name="AddressBookScreen"
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerTitle: translate("screens/Settings", "Address Book"),
        }}
      />

      <PortfolioStack.Screen
        component={AddOrEditAddressBookScreen}
        name="AddOrEditAddressBookScreen"
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate(
                "screens/AddOrEditAddressBookScreen",
                "Add New Address",
              )}
            />
          ),
          headerBackTitleVisible: false,
        }}
      />

      <PortfolioStack.Screen
        component={AddLiquidityScreen as any}
        name="AddLiquidity"
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerTitle: translate("screens/AddLiquidity", "Add Liquidity"),
        }}
      />

      <PortfolioStack.Screen
        component={ConfirmAddLiquidityScreen as any}
        name="ConfirmAddLiquidity"
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerTitle: translate("screens/ConfirmAddLiq", "Confirm"),
        }}
      />

      <PortfolioStack.Screen
        component={WithdrawFutureSwapScreen}
        name="WithdrawFutureSwapScreen"
        options={{
          ...screenOptions,
          headerTitle: translate(
            "screens/WithdrawFutureSwapScreen",
            "Withdraw",
          ),
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerBackTitleVisible: false,
        }}
      />

      <PortfolioStack.Screen
        component={RemoveLiquidityScreen as any}
        name="RemoveLiquidity"
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerTitle: translate("screens/DexScreen", "Remove Liquidity"),
        }}
      />

      <PortfolioStack.Screen
        component={FutureSwapScreen}
        name="FutureSwapScreen"
        options={{
          ...screenOptions,
          headerTitle: translate("screens/FutureSwapScreen", "Future Swaps"),
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerBackTitleVisible: false,
        }}
      />

      <PortfolioStack.Screen
        component={ConfirmWithdrawFutureSwapScreen}
        name="ConfirmWithdrawFutureSwapScreen"
        options={{
          ...screenOptions,
          headerTitle: translate(
            "screens/ConfirmWithdrawFutureSwapScreen",
            "Confirm",
          ),
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerBackTitleVisible: false,
        }}
      />

      <PortfolioStack.Screen
        component={RemoveLiquidityConfirmScreen as any}
        name="RemoveLiquidityConfirmScreen"
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerTitle: translate("screens/DexScreen", "Confirm"),
        }}
      />

      <PortfolioStack.Screen
        component={TransactionsScreen}
        name="TransactionsScreen"
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerTitle: translate("screens/TransactionsScreen", "Transactions"),
        }}
      />

      <PortfolioStack.Screen
        component={TransactionDetailScreen}
        name="TransactionDetailScreen"
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerTitle: translate(
            "screens/TransactionDetailScreen",
            "Transaction",
          ),
        }}
      />
      <PortfolioStack.Screen
        component={TokensVsUtxoFaq}
        name="TokensVsUtxoFaq"
        options={{
          ...screenOptions,
          headerTitle: translate(
            "components/UtxoVsTokenFaq",
            "About UTXO And Tokens",
          ),
        }}
      />
      <PortfolioStack.Screen
        component={OCGProposalsScreen}
        name="OCGProposalsScreen"
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerTitle: translate("screens/OCGProposalsScreen", "Governance"),
        }}
      />
      <PortfolioStack.Screen
        component={CFPDetailScreen}
        name="CFPDetailScreen"
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerTitle: translate("screens/OCGDetailScreen", "CFP Details"),
        }}
      />
      <PortfolioStack.Screen
        component={DFIPDetailScreen}
        name="DFIPDetailScreen"
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerTitle: translate("screens/OCGDetailScreen", "DFIP Details"),
        }}
      />
      <PortfolioStack.Screen
        component={OCGConfirmScreen}
        name="OCGConfirmScreen"
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerTitle: translate("screens/OCGConfirmScreen", "Confirm"),
        }}
      />
    </PortfolioStack.Navigator>
  );
}
