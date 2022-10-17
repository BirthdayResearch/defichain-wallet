import BigNumber from "bignumber.js";
import { ThemedText, ThemedView } from "@components/themed";
import { tailwind } from "@tailwind";
import { SymbolIcon } from "@components/SymbolIcon";
import { IconButton } from "@components/IconButton";
import { translate } from "@translations";
import { loanTokensSelector, LoanVault } from "@store/loans";
import {
  LoanToken,
  LoanVaultActive,
  LoanVaultState,
  LoanVaultTokenAmount,
} from "@defichain/whale-api-client/dist/api/loan";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { LoanParamList } from "@screens/AppNavigator/screens/Loans/LoansNavigator";
import { useLoanOperations } from "@screens/AppNavigator/screens/Loans/hooks/LoanOperations";
import { getActivePrice } from "@screens/AppNavigator/screens/Auctions/helpers/ActivePrice";
import { ActiveUSDValue } from "@screens/AppNavigator/screens/Loans/VaultDetail/components/ActiveUSDValue";
import { BottomSheetNavScreen } from "@components/BottomSheetWithNav";
import { View } from "react-native";
import { useFeatureFlagContext } from "@contexts/FeatureFlagContext";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import { EmptyLoan } from "./EmptyLoan";
import { VaultSectionTextRow } from "../../components/VaultSectionTextRow";

interface LoanCardProps {
  symbol: string;
  displaySymbol: string;
  amount: string;
  interestAmount?: string;
  vaultState: LoanVaultState;
  vault?: LoanVaultActive;
  loanTokenAmount: LoanVaultTokenAmount;
  loanToken: LoanToken;
  dismissModal: () => void;
  expandModal: () => void;
  setBottomSheetScreen: (val: BottomSheetNavScreen[]) => void;
}

export function LoansTab(props: {
  vault: LoanVault;
  dismissModal: () => void;
  expandModal: () => void;
  setBottomSheetScreen: (val: BottomSheetNavScreen[]) => void;
}): JSX.Element {
  const { vault, dismissModal, expandModal, setBottomSheetScreen } = props;
  const loanTokens = useSelector((state: RootState) =>
    loanTokensSelector(state.loans)
  );
  const getLoanTokenById = (tokenId: string): LoanToken => {
    return loanTokens.find(
      (loanToken) => loanToken.token.id === tokenId
    ) as LoanToken;
  };
  return (
    <ThemedView style={tailwind("p-4")}>
      {vault.state === LoanVaultState.ACTIVE && vault.loanValue === "0" && (
        <EmptyLoan vaultId={vault.vaultId} />
      )}
      {vault.state === LoanVaultState.IN_LIQUIDATION
        ? vault.batches.map((batch) => (
            <LoanCard
              key={batch.loan.id}
              symbol={batch.loan.id}
              displaySymbol={batch.loan.displaySymbol}
              amount={batch.loan.amount}
              vaultState={LoanVaultState.IN_LIQUIDATION}
              loanTokenAmount={batch.loan}
              loanToken={getLoanTokenById(batch.loan.id)}
              dismissModal={dismissModal}
              expandModal={expandModal}
              setBottomSheetScreen={setBottomSheetScreen}
            />
          ))
        : vault.loanAmounts.map((loan) => (
            <LoanCard
              key={loan.id}
              symbol={loan.symbol}
              displaySymbol={loan.displaySymbol}
              amount={loan.amount}
              interestAmount={
                vault.interestAmounts.find(
                  (interest) => interest.symbol === loan.symbol
                )?.amount
              }
              vaultState={vault.state}
              vault={vault}
              loanTokenAmount={loan}
              loanToken={getLoanTokenById(loan.id)}
              dismissModal={dismissModal}
              expandModal={expandModal}
              setBottomSheetScreen={setBottomSheetScreen}
            />
          ))}
    </ThemedView>
  );
}

function LoanCard(props: LoanCardProps): JSX.Element {
  const canUseOperations = useLoanOperations(props.vault?.state);
  const activePrice = new BigNumber(
    getActivePrice(props.symbol, props.loanTokenAmount.activePrice)
  );
  const isDUSDAsCollateral = props.vault?.collateralAmounts?.some(
    ({ symbol }) => symbol === "DUSD"
  );

  const { isFeatureAvailable } = useFeatureFlagContext();

  return (
    <ThemedView
      light={tailwind("bg-white border-gray-200")}
      dark={tailwind("bg-gray-800 border-gray-700")}
      style={tailwind("p-4 mb-2 border rounded")}
    >
      <View style={tailwind("flex flex-row items-center")}>
        <SymbolIcon
          symbol={props.displaySymbol}
          styleProps={tailwind("w-4 h-4")}
        />
        <ThemedText
          light={tailwind({
            "text-gray-300": props.vaultState === LoanVaultState.IN_LIQUIDATION,
            "text-black": props.vaultState !== LoanVaultState.IN_LIQUIDATION,
          })}
          dark={tailwind({
            "text-gray-700": props.vaultState === LoanVaultState.IN_LIQUIDATION,
            "text-white": props.vaultState !== LoanVaultState.IN_LIQUIDATION,
          })}
          style={tailwind("font-medium ml-2")}
          testID={`loan_card_${props.displaySymbol}`}
        >
          {props.displaySymbol}
        </ThemedText>
      </View>
      <View style={tailwind("mt-3")}>
        <VaultSectionTextRow
          value={new BigNumber(props.amount).toFixed(8)}
          lhs={translate(
            "components/VaultDetailsLoansTab",
            "Outstanding balance"
          )}
          testID={`loan_card_${props.displaySymbol}_outstanding_balance`}
          suffixType="text"
          suffix={` ${props.displaySymbol}`}
          style={tailwind("text-sm font-medium")}
          rhsThemedProps={{
            light: tailwind({
              "text-gray-300":
                props.vaultState === LoanVaultState.IN_LIQUIDATION,
              "text-black": props.vaultState !== LoanVaultState.IN_LIQUIDATION,
            }),
            dark: tailwind({
              "text-gray-700":
                props.vaultState === LoanVaultState.IN_LIQUIDATION,
              "text-white": props.vaultState !== LoanVaultState.IN_LIQUIDATION,
            }),
          }}
        />
        <ActiveUSDValue
          price={new BigNumber(props.amount).multipliedBy(activePrice)}
          containerStyle={tailwind("justify-end")}
          isOraclePrice
          testId={`loan_card_${props.displaySymbol}_outstanding_balance_value`}
        />
        {props.vaultState !== LoanVaultState.IN_LIQUIDATION && (
          <>
            <View style={tailwind("pt-1.5")}>
              <VaultSectionTextRow
                value={new BigNumber(props.interestAmount ?? 0).toFixed(8)}
                lhs={translate(
                  "components/VaultDetailsLoansTab",
                  "Interest amount"
                )}
                testID="text_interest_amount"
                suffixType="text"
                suffix={` ${props.displaySymbol}`}
                info={{
                  title: "Interest amount",
                  message:
                    "This amount is the total interest amount from both vault and token interest rate.",
                }}
              />
              <ActiveUSDValue
                price={new BigNumber(props.interestAmount ?? 0).multipliedBy(
                  activePrice
                )}
                containerStyle={tailwind("justify-end")}
                isOraclePrice
              />
            </View>
          </>
        )}
      </View>
      {props.vault !== undefined && (
        <View style={tailwind("mt-4 -mb-2")}>
          <ActionButtons
            testID={`loan_card_${props.displaySymbol}`}
            vault={props.vault}
            loanTokenAmount={props.loanTokenAmount}
            loanToken={props.loanToken}
            canUseOperations={canUseOperations}
          />
          {isDUSDAsCollateral &&
            props.displaySymbol === "DUSD" &&
            isFeatureAvailable("unloop_dusd") && (
              <PaybackDUSDLoan
                vault={props.vault}
                paybackAmount={new BigNumber(props.loanTokenAmount.amount)}
                loanToken={props.loanTokenAmount}
              />
            )}
        </View>
      )}
    </ThemedView>
  );
}

function PaybackDUSDLoan({
  loanToken,
  vault,
  paybackAmount,
}: {
  loanToken: LoanVaultTokenAmount;
  vault: LoanVaultActive;
  paybackAmount: BigNumber;
}): JSX.Element {
  const navigation = useNavigation<NavigationProp<LoanParamList>>();
  const collateralDUSD = vault?.collateralAmounts?.find(
    ({ symbol }) => symbol === "DUSD"
  );
  const collateralDUSDAmount = collateralDUSD?.amount ?? 0;

  const onPaybackDUSD = (): void => {
    navigation.navigate({
      name: "PaybackLoanScreen",
      params: {
        loanTokenAmount: {
          ...loanToken,
          amount: BigNumber.min(collateralDUSDAmount, paybackAmount),
        },
        vault,
        isPaybackDUSDUsingCollateral: true,
      },
      merge: true,
    });
  };
  return (
    <IconButton
      iconLabel={translate(
        "components/PaybackDUSD",
        "PAYBACK WITH DUSD COLLATERAL"
      )}
      style={tailwind("mb-2 p-2 w-full justify-center flex-1")}
      testID="loan_card_DUSD_payback_dusd_loan"
      onPress={onPaybackDUSD}
    />
  );
}

function ActionButtons({
  vault,
  loanTokenAmount,
  loanToken,
  canUseOperations,
  testID,
}: {
  vault: LoanVaultActive;
  loanTokenAmount: LoanVaultTokenAmount;
  loanToken: LoanToken;
  canUseOperations: boolean;
  testID: string;
}): JSX.Element {
  const navigation = useNavigation<NavigationProp<LoanParamList>>();
  return (
    <View style={tailwind("flex flex-row justify-between -mx-2")}>
      <View style={tailwind("flex flex-row flex-wrap flex-1 justify-between")}>
        <IconButton
          disabled={!canUseOperations}
          iconLabel={translate(
            "components/VaultDetailsLoansTab",
            "PAYBACK LOAN"
          )}
          style={tailwind("mb-2 p-2 mx-2 flex-grow justify-center")}
          testID={`${testID}_payback_loan`}
          onPress={() => {
            navigation.navigate({
              name: "PaybackLoanScreen",
              merge: true,
              params: {
                vault,
                loanTokenAmount,
              },
            });
          }}
        />
        <IconButton
          disabled={!canUseOperations || vault.state === LoanVaultState.FROZEN}
          iconLabel={translate(
            "components/VaultDetailsLoansTab",
            "BORROW MORE"
          )}
          style={tailwind("mb-2 p-2 mx-2 flex-grow justify-center")}
          testID={`${testID}_borrow_more`}
          onPress={() => {
            navigation.navigate({
              name: "BorrowLoanTokenScreen",
              merge: true,
              params: {
                vault,
                loanToken,
              },
            });
          }}
        />
      </View>
    </View>
  );
}
