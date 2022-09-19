import { NavigationProp, useNavigation } from "@react-navigation/native";
import { PoolPairData } from "@defichain/whale-api-client/dist/api/poolpairs";
import { createStackNavigator } from "@react-navigation/stack";
import BigNumber from "bignumber.js";
import { HeaderFont } from "@components/Text";
import { HeaderTitle } from "@components/HeaderTitle";
import { PriceRateProps } from "@components/PricesSection";
import { translate } from "@translations";
import { WalletToken } from "@store/wallet";
import { useNavigatorScreenOptions } from "@hooks/useNavigatorScreenOptions";
import { HeaderNetworkStatus } from "@components/HeaderNetworkStatus";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, StyleProp, ViewStyle } from "react-native";
import { ThemedTextV2 } from "@components/themed";
import { tailwind } from "@tailwind";
import { useFeatureFlagContext } from "@contexts/FeatureFlagContext";
import {
  SelectionToken,
  SwapTokenSelectionScreen,
  TokenListType,
} from "@screens/AppNavigator/screens/Dex/CompositeSwap/SwapTokenSelectionScreen";
import { PriceRateProps as PriceRatesPropsV2 } from "@components/PricesSectionV2";
import { NetworkSelectionScreen } from "../Settings/screens/NetworkSelectionScreen";
import { ConversionParam } from "../Portfolio/PortfolioNavigator";
import {
  CompositeSwapForm,
  ConfirmCompositeSwapScreen,
} from "./CompositeSwap/ConfirmCompositeSwapScreen";
import {
  CompositeSwapScreen,
  OwnedTokenState,
  TokenState,
} from "./CompositeSwap/CompositeSwapScreen";
import { DexScreen } from "./DexScreen";
import { NetworkDetails } from "../Settings/screens/NetworkDetails";
import { RemoveLiquidityScreen } from "./DexRemoveLiquidity";
import { RemoveLiquidityConfirmScreen } from "./DexConfirmRemoveLiquidity";
import { AddLiquidityScreen } from "./DexAddLiquidity";
import { ConfirmAddLiquidityScreen } from "./DexConfirmAddLiquidity";
import { PoolPairDetailsScreen } from "./PoolPairDetailsScreen";
import { CompositeSwapScreenV2 } from "./CompositeSwap/CompositeSwapScreenV2";
import { ConfirmCompositeSwapScreenV2 } from "./CompositeSwap/ConfirmCompositeSwapScreenV2";

export interface DexParamList {
  DexScreen: undefined;
  CompositeSwapScreen: {
    pair?: PoolPairData;
    fromToken?: WalletToken;
    tokenSelectOption?: {
      from: {
        isDisabled: boolean;
        isPreselected: boolean;
      };
      to: {
        isDisabled: boolean;
        isPreselected: boolean;
      };
    };
  };
  CompositeSwapScreenV2: {
    pair?: PoolPairData;
    fromToken?: WalletToken;
    tokenSelectOption?: {
      from: {
        isDisabled: boolean;
        isPreselected: boolean;
      };
      to: {
        isDisabled: boolean;
        isPreselected: boolean;
      };
    };
    originScreen: DexScreenOrigin;
  };
  SwapTokenSelectionScreen: {
    fromToken: {
      symbol?: string;
      displaySymbol?: string;
    };
    listType: TokenListType;
    list: SelectionToken[];
    onTokenPress: (token: SelectionToken) => void;
    isFutureSwap: boolean;
    isSearchDTokensOnly?: boolean;
  };
  ConfirmCompositeSwapScreenV2: {
    conversion?: ConversionParam;
    fee: BigNumber;
    pairs: PoolPairData[];
    priceRates: PriceRatesPropsV2[];
    slippage: BigNumber;
    swap: CompositeSwapForm;
    futureSwap?: {
      executionBlock: number;
      transactionDate: string;
      isSourceLoanToken: boolean;
      oraclePriceText: string;
    };
    tokenA: OwnedTokenState;
    tokenB: TokenState & { amount?: string };
    estimatedAmount: BigNumber;
    totalFees: string;
    estimatedLessFeesAfterSlippage: string;
    originScreen: DexScreenOrigin;
  };
  ConfirmCompositeSwapScreen: {
    conversion?: ConversionParam;
    fee: BigNumber;
    pairs: PoolPairData[];
    priceRates: PriceRateProps[];
    slippage: BigNumber;
    swap: CompositeSwapForm;
    futureSwap?: {
      executionBlock: number;
      transactionDate: string;
      isSourceLoanToken: boolean;
      oraclePriceText: string;
    };
    tokenA: OwnedTokenState;
    tokenB: TokenState & { amount?: string };
    estimatedAmount: BigNumber;
  };
  AddLiquidity: {
    pair: PoolPairData;
    pairInfo: WalletToken;
    originScreen: DexScreenOrigin;
  };
  ConfirmAddLiquidity: {
    pair: PoolPairData;
    summary: AddLiquiditySummary;
    conversion?: ConversionParam;
    pairInfo: WalletToken;
    originScreen: DexScreenOrigin;
  };
  RemoveLiquidity: {
    pair: PoolPairData;
    pairInfo: WalletToken;
    originScreen: DexScreenOrigin;
  };
  ConfirmRemoveLiquidity: {
    amount: BigNumber;
    fee: BigNumber;
    pair: PoolPairData;
    pairInfo: WalletToken;
    tokenAAmount: string;
    tokenBAmount: string;
    tokenA?: WalletToken;
    tokenB?: WalletToken;
  };
  PoolPairDetailsScreen: {
    id: string;
  };
  RemoveLiquidityConfirmScreen: {
    pair: PoolPairData;
    pairInfo: WalletToken;
    amount: BigNumber;
    fee: BigNumber;
    tokenAAmount: BigNumber;
    tokenBAmount: BigNumber;
    tokenA?: WalletToken;
    tokenB?: WalletToken;
    originScreen: DexScreenOrigin;
  };

  [key: string]: undefined | object;
}

export interface AddLiquiditySummary {
  fee: BigNumber; // stick to whatever estimation/calculation done on previous page
  tokenAAmount: BigNumber; // transaction amount
  tokenBAmount: BigNumber; // transaction amount
  percentage: BigNumber; // to add
  tokenABalance: BigNumber; // token A balance (after deducting 0.1 DFI if DFI)
  tokenBBalance: BigNumber; // token B balance (after deducting 0.1 DFI if DFI)
  lmTotalTokens: string; // total LP tokens
}

export enum DexScreenOrigin {
  Portfolio_screen = "PortfolioScreen",
  Dex_screen = "DexScreen",
}

const DexStack = createStackNavigator<DexParamList>();

export function DexNavigator(): JSX.Element {
  const navigation = useNavigation<NavigationProp<DexParamList>>();
  const headerContainerTestId = "dex_header_container";
  const screenOptions = useNavigatorScreenOptions();
  const goToNetworkSelect = (): void => {
    navigation.navigate("NetworkSelectionScreen");
  };
  const insets = useSafeAreaInsets();
  const { isFeatureAvailable } = useFeatureFlagContext();

  return (
    <DexStack.Navigator
      initialRouteName="DexScreen"
      screenOptions={{
        headerTitleAlign: "center",
        headerTitleStyle: HeaderFont,
        headerBackTitleVisible: false,
      }}
    >
      <DexStack.Screen
        component={DexScreen}
        name="DexScreen"
        options={{
          ...screenOptions,
          headerLeft: undefined,
          headerLeftContainerStyle: null,
          headerTitleAlign: "left",
          headerTitleContainerStyle: tailwind("mt-4 ml-5"),
          headerRightContainerStyle: [
            screenOptions.headerRightContainerStyle,
            tailwind("mt-5 justify-start", { "pr-3": Platform.OS === "web" }),
          ],
          headerStyle: [
            screenOptions.headerStyle,
            tailwind("rounded-b-none border-b-0"),
            {
              shadowOpacity: 0,
              height: (Platform.OS !== "android" ? 88 : 96) + insets.top,
            },
          ],
          headerTitle: () => (
            <ThemedTextV2
              style={[
                screenOptions.headerTitleStyle as Array<StyleProp<ViewStyle>>,
                tailwind("text-left text-3xl font-semibold-v2"),
                // eslint-disable-next-line react-native/no-inline-styles
                { fontSize: 28 },
              ]}
            >
              {translate("screens/DexScreen", "Decentralized \nExchange")}
            </ThemedTextV2>
          ),
          headerRight: () => (
            <HeaderNetworkStatus
              onPress={goToNetworkSelect}
              containerStyle={tailwind({ "pt-px": Platform.OS === "android" })}
            />
          ),
        }}
      />

      <DexStack.Screen
        component={NetworkSelectionScreen}
        name="NetworkSelectionScreen"
        options={{
          ...screenOptions,
          headerTitle: translate("screens/NetworkSelectionScreen", "Network"),
          headerRight: undefined,
        }}
      />

      <DexStack.Screen
        component={AddLiquidityScreen}
        name="AddLiquidity"
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerTitle: translate("screens/DexScreen", "Add Liquidity"),
        }}
      />

      <DexStack.Screen
        component={ConfirmAddLiquidityScreen}
        name="ConfirmAddLiquidity"
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerTitle: translate("screens/DexScreen", "Confirm"),
        }}
      />

      <DexStack.Screen
        component={RemoveLiquidityScreen}
        name="RemoveLiquidity"
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerTitle: translate("screens/DexScreen", "Remove Liquidity"),
        }}
      />

      <DexStack.Screen
        component={RemoveLiquidityConfirmScreen}
        name="RemoveLiquidityConfirmScreen"
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerTitle: translate("screens/DexScreen", "Confirm"),
        }}
      />

      <DexStack.Screen
        component={
          isFeatureAvailable("composite_swap_v2")
            ? CompositeSwapScreenV2
            : (CompositeSwapScreen as any)
        }
        name="CompositeSwap"
        options={{
          ...screenOptions,
          headerTitle: isFeatureAvailable("composite_swap_v2")
            ? translate("screens/DexScreen", "Swap")
            : () => (
                <HeaderTitle
                  text={translate("screens/DexScreen", "Swap")}
                  containerTestID={headerContainerTestId}
                />
              ),
          ...(isFeatureAvailable("composite_swap_v2") && {
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
          }),
        }}
      />

      <DexStack.Screen
        component={SwapTokenSelectionScreen as any}
        name="SwapTokenSelectionScreen"
        options={{
          ...screenOptions,
          headerTitle: translate("screens/SwapTokenSelectionScreen", "Select"),
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
        }}
      />

      <DexStack.Screen
        component={
          isFeatureAvailable("composite_swap_v2")
            ? ConfirmCompositeSwapScreenV2
            : (ConfirmCompositeSwapScreen as any)
        }
        name={
          isFeatureAvailable("composite_swap_v2")
            ? "ConfirmCompositeSwapScreenV2"
            : "ConfirmCompositeSwapScreen"
        }
        options={{
          ...screenOptions,
          headerTitle: isFeatureAvailable("composite_swap_v2")
            ? translate("screens/DexScreen", "Confirm")
            : () => (
                <HeaderTitle
                  text={translate("screens/DexScreen", "Confirm swap")}
                  containerTestID={headerContainerTestId}
                />
              ),
          ...(isFeatureAvailable("composite_swap_v2") && {
            headerRight: () => (
              <HeaderNetworkStatus onPress={goToNetworkSelect} />
            ),
          }),
        }}
      />

      <DexStack.Screen
        component={NetworkDetails}
        name="NetworkDetails"
        options={{
          headerTitle: translate("screens/NetworkDetails", "Wallet Network"),
          headerBackTitleVisible: false,
          headerBackTestID: "network_details_header_back",
        }}
      />

      <DexStack.Screen
        component={PoolPairDetailsScreen}
        name="PoolPairDetailsScreen"
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
        }}
      />
    </DexStack.Navigator>
  );
}
