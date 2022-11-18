import { createStackNavigator } from "@react-navigation/stack";
import { HeaderFont } from "@components/Text";
import { HeaderTitle } from "@components/HeaderTitle";
import { translate } from "@translations";
import BigNumber from "bignumber.js";
import { ConversionParam } from "@screens/AppNavigator/screens/Portfolio/PortfolioNavigator";
import { PaybackLoanScreen } from "@screens/AppNavigator/screens/Loans/screens/PaybackLoanScreen";
import { ConfirmPaybackLoanScreen } from "@screens/AppNavigator/screens/Loans/screens/ConfirmPaybackLoanScreen";
import { useNavigatorScreenOptions } from "@hooks/useNavigatorScreenOptions";
import { TokenData } from "@defichain/whale-api-client/dist/api/tokens";
import {
  LoanScheme,
  LoanToken,
  LoanVaultActive,
  LoanVaultTokenAmount,
} from "@defichain/whale-api-client/dist/api/loan";
import { CreateVaultScreenV2 } from "@screens/AppNavigator/screens/Loans/screens/CreateVaultScreenV2";
import { HeaderNetworkStatus } from "@components/HeaderNetworkStatus";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { VaultDetailScreen } from "@screens/AppNavigator/screens/Loans/VaultDetail/VaultDetailScreen";
import { tailwind } from "@tailwind";
import { ThemedTextV2 } from "@components/themed";
import { StyleProp, ViewStyle } from "react-native";
import { NetworkDetails } from "../Settings/screens/NetworkDetails";
import { ConfirmCreateVaultScreen } from "./screens/ConfirmCreateVaultScreen";
import {
  CollateralItem,
  EditCollateralScreen,
} from "./screens/EditCollateralScreen";
import { AddOrRemoveCollateralScreen } from "./screens/AddOrRemoveCollateralScreen";
import { ConfirmEditCollateralScreen } from "./screens/ConfirmEditCollateralScreen";
import { BorrowLoanTokenScreen } from "./screens/BorrowLoanTokenScreen";
import { ConfirmBorrowLoanTokenScreen } from "./screens/ConfirmBorrowLoanTokenScreen";
import { EditLoanSchemeScreen } from "./screens/EditLoanSchemeScreen";
import { ConfirmEditLoanSchemeScreen } from "./screens/ConfirmEditLoanSchemeScreen";
import { LoansFaq } from "./screens/LoansFaq";
import { LoansScreen } from "./LoansScreen";
import { CloseVaultScreenV2 } from "./screens/CloseVaultScreenV2";

export interface LoanParamList {
  LoansScreen: {};
  CreateVaultScreen: {
    loanScheme?: LoanScheme;
  };
  ConfirmCreateVaultScreen: {
    loanScheme: LoanScheme;
    fee: BigNumber;
    conversion?: ConversionParam;
  };
  VaultDetailScreen: {
    vaultId: string;
  };
  EditCollateralScreen: {
    vaultId: string;
  };
  AddOrRemoveCollateralScreen: {
    vault: LoanVaultActive;
    collateralItem: CollateralItem;
    collateralTokens: CollateralItem[];
    isAdd: boolean;
  };
  ConfirmEditCollateralScreen: {
    vault: LoanVaultActive;
    amount: BigNumber;
    token: TokenData;
    fee: BigNumber;
    isAdd: boolean;
    collateralItem: CollateralItem;
    resultingColRatio: BigNumber;
    totalVaultCollateralValue: BigNumber;
    vaultShare: BigNumber;
    maxLoanAmount: BigNumber;
    conversion?: ConversionParam;
  };
  BorrowLoanTokenScreen: {
    loanToken: LoanToken;
    vault: LoanVaultActive;
  };
  ConfirmBorrowLoanTokenScreen: {
    loanToken: LoanToken;
    vault: LoanVaultActive;
    borrowAmount: string;
    annualInterest: BigNumber;
    fee: BigNumber;
    resultingColRatio: BigNumber;
  };
  PaybackLoanScreen: {
    loanTokenAmount: LoanVaultTokenAmount;
    vault: LoanVaultActive;
    isPaybackDUSDUsingCollateral?: boolean;
  };
  ConfirmPaybackLoanScreen: {
    vault: LoanVaultActive;
    amountToPay: BigNumber;
    fee: BigNumber;
    tokenBalance: BigNumber;
    loanTokenAmount: LoanVaultTokenAmount;
    resultingColRatio: BigNumber;
    isPaybackDUSDUsingCollateral?: boolean;
    loanTokenActivePriceInUSD: string;
  };
  EditLoanSchemeScreen: {
    vaultId: string;
  };
  ConfirmEditLoanSchemeScreen: {
    vault: LoanVaultActive;
    loanScheme: LoanScheme;
    fee: BigNumber;
  };
  BorrowMoreScreen: {
    loanTokenAmount: LoanVaultTokenAmount;
    vault: LoanVaultActive;
  };
  CloseVaultScreen: {
    vaultId: string;
  };
  LoansFaq: {
    activeSessions?: number[];
  };

  [key: string]: undefined | object;
}

const LoansStack = createStackNavigator<LoanParamList>();

export function LoansNavigator(): JSX.Element {
  const navigation = useNavigation<NavigationProp<LoanParamList>>();
  const headerContainerTestId = "loans_header_container";
  const screenOptions = useNavigatorScreenOptions();
  const goToNetworkSelect = (): void => {
    navigation.navigate("NetworkSelectionScreen");
  };

  return (
    <LoansStack.Navigator
      initialRouteName="LoansScreen"
      screenOptions={{
        headerTitleAlign: "center",
        headerTitleStyle: HeaderFont,
        headerBackTitleVisible: false,
      }}
    >
      <LoansStack.Screen
        component={LoansScreen}
        name="LoansScreen"
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus
              onPress={goToNetworkSelect}
              testID="header_change_network"
            />
          ),
          headerTitleAlign: "left",
          headerTitleContainerStyle: tailwind("ml-5"),
          headerLeftContainerStyle: null,
          headerTitle: () => (
            <ThemedTextV2
              style={[
                screenOptions.headerTitleStyle as Array<StyleProp<ViewStyle>>,
                tailwind("text-left text-3xl font-semibold-v2"),
                { fontSize: 28 },
              ]}
            >
              {translate("screens/LoansScreen", "Loans")}
            </ThemedTextV2>
          ),
        }}
      />
      <LoansStack.Screen
        component={NetworkDetails}
        name="NetworkDetails"
        options={{
          headerTitle: translate("screens/NetworkDetails", "Wallet Network"),
          headerBackTitleVisible: false,
          headerBackTestID: "network_details_header_back",
        }}
      />
      <LoansStack.Screen
        component={CreateVaultScreenV2}
        name="CreateVaultScreen"
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerTitle: translate("screens/LoansScreen", "Create Vault"),
        }}
      />
      <LoansStack.Screen
        component={ConfirmCreateVaultScreen}
        name="ConfirmCreateVaultScreen"
        options={{
          headerBackTitleVisible: false,
          headerTitle: () => (
            <HeaderTitle
              text={translate("screens/LoansScreen", "Confirm Create Vault")}
            />
          ),
        }}
      />
      <LoansStack.Screen
        component={VaultDetailScreen}
        name="VaultDetailScreen"
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerTitle: translate("screens/LoansScreen", "Vault Details"),
        }}
      />
      <LoansStack.Screen
        component={EditCollateralScreen}
        name="EditCollateralScreen"
        options={{
          headerBackTitleVisible: false,
          headerTitle: () => (
            <HeaderTitle
              text={translate("screens/LoansScreen", "Edit Collateral")}
            />
          ),
        }}
      />
      <LoansStack.Screen
        component={AddOrRemoveCollateralScreen}
        name="AddOrRemoveCollateralScreen"
        options={({ route }: { route: any }) => ({
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerTitle: translate(
            "screens/LoansScreen",
            route?.params?.isAdd ? "Add Collateral" : "Remove Collateral"
          ),
        })}
      />
      <LoansStack.Screen
        component={ConfirmEditCollateralScreen}
        name="ConfirmEditCollateralScreen"
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerTitle: translate("screens/LoansScreen", "Confirm"),
        }}
      />
      <LoansStack.Screen
        component={BorrowLoanTokenScreen}
        name="BorrowLoanTokenScreen"
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerTitle: translate("screens/LoansScreen", "Borrow"),
        }}
      />
      <LoansStack.Screen
        component={ConfirmBorrowLoanTokenScreen}
        name="ConfirmBorrowLoanTokenScreen"
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerTitle: translate("screens/LoansScreen", "Confirm"),
        }}
      />
      <LoansStack.Screen
        component={LoansFaq}
        name="LoansFaq"
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate("components/LoansFaq", "Loans FAQ")}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false,
        }}
      />
      <LoansStack.Screen
        component={PaybackLoanScreen}
        name="PaybackLoanScreen"
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerTitle: translate("screens/LoansScreen", "Payback Loan"),
        }}
      />
      <LoansStack.Screen
        component={ConfirmPaybackLoanScreen}
        name="ConfirmPaybackLoanScreen"
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerTitle: translate("screens/ConfirmPaybackLoanScreen", "Confirm"),
        }}
      />
      <LoansStack.Screen
        component={EditLoanSchemeScreen}
        name="EditLoanSchemeScreen"
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerTitle: translate("screens/LoansScreen", "Edit Vault"),
        }}
      />
      <LoansStack.Screen
        component={ConfirmEditLoanSchemeScreen}
        name="ConfirmEditLoanSchemeScreen"
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerTitle: translate("screens/LoansScreen", "Confirm"),
        }}
      />
      <LoansStack.Screen
        component={CloseVaultScreenV2}
        name="CloseVaultScreen"
        options={{
          ...screenOptions,
          headerTitle: translate("screens/LoansScreen", "Close Vault"),
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
        }}
      />
    </LoansStack.Navigator>
  );
}
