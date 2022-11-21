import { NavigationProp, useNavigation } from "@react-navigation/native";
import { PoolPairData } from "@defichain/whale-api-client/dist/api/poolpairs";
import { createStackNavigator } from "@react-navigation/stack";
import BigNumber from "bignumber.js";
import { HeaderFont } from "@components/Text";
import { translate } from "@translations";
import { WalletToken } from "@store/wallet";
import { useNavigatorScreenOptions } from "@hooks/useNavigatorScreenOptions";
import { HeaderNetworkStatus } from "@components/HeaderNetworkStatus";
import { tailwind } from "@tailwind";
import {
  SelectionToken,
  SwapTokenSelectionScreen,
  TokenListType,
} from "@screens/AppNavigator/screens/Dex/CompositeSwap/SwapTokenSelectionScreen";
import { PriceRateProps as PriceRatesPropsV2 } from "@components/PricesSection";
import { ThemedTextV2 } from "@components/themed";
import { StyleProp, View, ViewStyle } from "react-native";
import { ScreenName } from "@screens/enum";
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
    originScreen: ScreenName;
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
  ConfirmCompositeSwapScreen: {
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
    originScreen: ScreenName;
  };
  AddLiquidity: {
    pair: PoolPairData;
    pairInfo: WalletToken;
    originScreen: ScreenName;
  };
  ConfirmAddLiquidity: {
    pair: PoolPairData;
    summary: AddLiquiditySummary;
    conversion?: ConversionParam;
    pairInfo: WalletToken;
    originScreen: ScreenName;
  };
  RemoveLiquidity: {
    pair: PoolPairData;
    pairInfo: WalletToken;
    originScreen: ScreenName;
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
    originScreen: ScreenName;
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

const DexStack = createStackNavigator<DexParamList>();

export function DexNavigator(): JSX.Element {
  const navigation = useNavigation<NavigationProp<DexParamList>>();
  const screenOptions = useNavigatorScreenOptions();
  const goToNetworkSelect = (): void => {
    navigation.navigate("NetworkSelectionScreen");
  };

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
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerTitleAlign: "left",
          headerTitleContainerStyle: tailwind("ml-5 -mb-3"),
          headerLeftContainerStyle: null,
          headerTitle: () => (
            <View style={tailwind("pt-4")}>
              <ThemedTextV2
                style={[
                  screenOptions.headerTitleStyle as Array<StyleProp<ViewStyle>>,
                  tailwind("text-left text-3xl font-semibold-v2"),
                  { fontSize: 28 },
                ]}
              >
                {translate("screens/DexScreen", "Decentralized \nExchange")}
              </ThemedTextV2>
            </View>
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
        component={ConfirmCompositeSwapScreen}
        name="ConfirmCompositeSwapScreen"
        options={{
          ...screenOptions,
          headerTitle: translate("screens/DexScreen", "Confirm"),
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
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
