import { createStackNavigator } from "@react-navigation/stack";
import { HeaderFont } from "@components/Text";
import { HeaderTitle } from "@components/HeaderTitle";
import { translate } from "@translations";
import BigNumber from "bignumber.js";
import { ConversionParam } from "@screens/AppNavigator/screens/Portfolio/PortfolioNavigator";
import { TabKey } from "@screens/AppNavigator/screens/Loans/VaultDetail/components/VaultDetailTabSection";
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
import { useNavigatorHeaderStylesOption } from "@screens/AppNavigator/hooks/useNavigatorHeaderStylesOption";
import { CreateVaultScreenV2 } from "@screens/AppNavigator/screens/Loans/screens/CreateVaultScreenV2";
import { HeaderNetworkStatus } from "@components/HeaderNetworkStatus";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { NetworkDetails } from "../Settings/screens/NetworkDetails";
import { ConfirmCreateVaultScreen } from "./screens/ConfirmCreateVaultScreen";
import { VaultDetailScreen } from "./VaultDetail/VaultDetailScreen";
import {
  CollateralItem,
  EditCollateralScreen,
} from "./screens/EditCollateralScreen";
import { ConfirmEditCollateralScreen } from "./screens/ConfirmEditCollateralScreen";
import { ChooseLoanTokenScreenV2 } from "./screens/ChooseLoanTokenScreenV2";
import { BorrowLoanTokenScreen } from "./screens/BorrowLoanTokenScreen";
import { ConfirmBorrowLoanTokenScreen } from "./screens/ConfirmBorrowLoanTokenScreen";
import { EditLoanSchemeScreen } from "./screens/EditLoanSchemeScreen";
import { ConfirmEditLoanSchemeScreen } from "./screens/ConfirmEditLoanSchemeScreen";
import { BorrowMoreScreen } from "./screens/BorrowMoreScreen";
import { CloseVaultScreen } from "./screens/CloseVaultScreen";
import { PaymentTokenProps } from "./hooks/LoanPaymentTokenRate";
import { LoansFaq } from "./screens/LoansFaq";
import { LoansScreenV2 } from "./LoansScreenV2";

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
    tab?: TabKey;
  };
  EditCollateralScreen: {
    vaultId: string;
  };
  ChooseLoanTokenScreen: {
    vaultId?: string;
  };
  ConfirmEditCollateralScreen: {
    vault: LoanVaultActive;
    amount: BigNumber;
    token: TokenData;
    fee: BigNumber;
    isAdd: boolean;
    collateralItem: CollateralItem;
    conversion?: ConversionParam;
  };
  BorrowLoanTokenScreen: {
    loanToken: LoanToken;
    vault?: LoanVaultActive;
  };
  ConfirmBorrowLoanTokenScreen: {
    loanToken: LoanToken;
    vault: LoanVaultActive;
    amountToBorrow: string;
    totalInterestAmount: BigNumber;
    totalLoanWithInterest: BigNumber;
    fee: BigNumber;
    resultingColRatio: BigNumber;
  };
  PaybackLoanScreen: {
    loanTokenAmount: LoanVaultTokenAmount;
    vault: LoanVaultActive;
  };
  ConfirmPaybackLoanScreen: {
    fee: BigNumber;
    amountToPayInLoanToken: BigNumber;
    amountToPayInPaymentToken: BigNumber;
    selectedPaymentTokenBalance: BigNumber;
    loanTokenBalance: BigNumber;
    paymentToken: Omit<PaymentTokenProps, "tokenBalance">;
    vault: LoanVaultActive;
    loanTokenAmount: LoanVaultTokenAmount;
    excessAmount?: BigNumber;
    resultingColRatio: BigNumber;
    conversion?: ConversionParam;
    paymentPenalty: BigNumber;
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

  const loansScreenHeaderTitle = useNavigatorHeaderStylesOption({
    destination: "screen/LoansScreen",
    headerTitle: "Loans",
  });

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
        component={LoansScreenV2}
        name="LoansScreen"
        options={{
          ...screenOptions,
          ...loansScreenHeaderTitle,
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
          headerBackTitleVisible: false,
          headerTitle: () => (
            <HeaderTitle
              text={translate("screens/LoansScreen", "Vault Detail")}
            />
          ),
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
        component={ConfirmEditCollateralScreen}
        name="ConfirmEditCollateralScreen"
        options={({ route }: { route: any }) => ({
          headerBackTitleVisible: false,
          headerTitle: () => {
            const isAdd = route?.params?.isAdd as boolean;
            return (
              <HeaderTitle
                text={translate(
                  "screens/LoansScreen",
                  `Confirm ${isAdd ? "Add" : "Remove"} Collateral`
                )}
              />
            );
          },
        })}
      />
      <LoansStack.Screen
        component={ChooseLoanTokenScreenV2}
        name="ChooseLoanTokenScreen"
        options={{
          headerBackTitleVisible: false,
          headerTitle: () => (
            <HeaderTitle
              text={translate(
                "screens/LoansScreen",
                "Choose Loan Token to Borrow"
              )}
            />
          ),
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
          headerBackTitleVisible: false,
          headerTitle: () => (
            <HeaderTitle
              text={translate(
                "screens/LoansScreen",
                "Confirm Borrow Loan Token"
              )}
            />
          ),
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
          headerBackTitleVisible: false,
          headerTitle: () => (
            <HeaderTitle
              text={translate("screens/LoansScreen", "Payback Loan")}
            />
          ),
        }}
      />
      <LoansStack.Screen
        component={ConfirmPaybackLoanScreen}
        name="ConfirmPaybackLoanScreen"
        options={{
          headerBackTitleVisible: false,
          headerTitle: () => (
            <HeaderTitle
              text={translate(
                "screens/ConfirmPaybackLoanScreen",
                "Confirm Loan Payment"
              )}
            />
          ),
        }}
      />
      <LoansStack.Screen
        component={EditLoanSchemeScreen}
        name="EditLoanSchemeScreen"
        options={{
          headerBackTitleVisible: false,
          headerTitle: () => (
            <HeaderTitle
              text={translate("screens/LoansScreen", "Edit Loan Scheme")}
            />
          ),
        }}
      />
      <LoansStack.Screen
        component={ConfirmEditLoanSchemeScreen}
        name="ConfirmEditLoanSchemeScreen"
        options={{
          headerBackTitleVisible: false,
          headerTitle: () => (
            <HeaderTitle
              text={translate(
                "screens/LoansScreen",
                "Confirm Edit Loan Scheme"
              )}
            />
          ),
        }}
      />
      <LoansStack.Screen
        component={BorrowMoreScreen}
        name="BorrowMoreScreen"
        options={{
          headerBackTitleVisible: false,
          headerTitle: () => (
            <HeaderTitle
              text={translate("screens/LoansScreen", "Borrow More")}
            />
          ),
        }}
      />
      <LoansStack.Screen
        component={CloseVaultScreen}
        name="CloseVaultScreen"
        options={{
          headerBackTitleVisible: false,
          headerTitle: () => (
            <HeaderTitle
              text={translate("screens/LoansScreen", "Close Vault")}
            />
          ),
        }}
      />
    </LoansStack.Navigator>
  );
}
