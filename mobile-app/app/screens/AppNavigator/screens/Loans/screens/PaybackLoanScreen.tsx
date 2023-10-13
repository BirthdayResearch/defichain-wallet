import { useEffect, useState } from "react";
import { StackScreenProps } from "@react-navigation/stack";
import { LoanParamList } from "@screens/AppNavigator/screens/Loans/LoansNavigator";
import { View } from "react-native";
import {
  ThemedScrollViewV2,
  ThemedTextInputV2,
  ThemedTextV2,
  ThemedViewV2,
} from "@components/themed";
import { getColor, tailwind } from "@tailwind";
import { translate } from "@translations";
import { NumericFormat as NumberFormat } from "react-number-format";
import BigNumber from "bignumber.js";
import {
  LoanVaultActive,
  LoanVaultTokenAmount,
} from "@defichain/whale-api-client/dist/api/loan";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import {
  hasTxQueued,
  hasOceanTXQueued,
  tokensSelector,
} from "@waveshq/walletkit-ui/dist/store";
import { useLoanOperations } from "@screens/AppNavigator/screens/Loans/hooks/LoanOperations";
import { getActivePrice } from "@screens/AppNavigator/screens/Auctions/helpers/ActivePrice";
import {
  activeVaultsSelector,
  fetchCollateralTokens,
  loanTokenByTokenId,
} from "@store/loans";
import {
  TransactionCard,
  AmountButtonTypes,
} from "@components/TransactionCard";
import {
  TokenDropdownButton,
  TokenDropdownButtonStatus,
} from "@components/TokenDropdownButton";
import { Controller, useForm } from "react-hook-form";
import { useThemeContext } from "@waveshq/walletkit-ui";
import { TextRowV2 } from "@components/TextRowV2";
import { NumberRowV2 } from "@components/NumberRowV2";
import { SubmitButtonGroup } from "@components/SubmitButtonGroup";
import { useToast } from "react-native-toast-notifications";
import { useWhaleApiClient } from "@waveshq/walletkit-ui/dist/contexts";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { useLogger } from "@shared-contexts/NativeLoggingProvider";
import { getTokenAmount } from "../hooks/LoanPaymentTokenRate";
import { useResultingCollateralRatio } from "../hooks/CollateralPrice";
import { useInterestPerBlock } from "../hooks/InterestPerBlock";
import { ActiveUSDValueV2 } from "../VaultDetail/components/ActiveUSDValueV2";
import { CollateralizationRatioDisplay } from "../components/CollateralizationRatioDisplay";

type Props = StackScreenProps<LoanParamList, "PaybackLoanScreen">;

export function PaybackLoanScreen({ navigation, route }: Props): JSX.Element {
  const routeParams = route.params;
  const client = useWhaleApiClient();
  const dispatch = useAppDispatch();
  const [vault, setVault] = useState(routeParams.vault);
  const [loanTokenAmount, setLoanTokenAmount] = useState(
    routeParams.loanTokenAmount,
  );
  const vaults = useSelector((state: RootState) =>
    activeVaultsSelector(state.loans),
  );

  useEffect(() => {
    dispatch(fetchCollateralTokens({ client }));
  }, []);

  const collateralTokens = useSelector(
    (state: RootState) => state.loans.collateralTokens,
  );

  useEffect(() => {
    const vault = vaults.find((v) => v.vaultId === routeParams.vault.vaultId);
    if (vault !== undefined) {
      setVault(vault);
    }
    const loanTokenAmount = vault?.loanAmounts.find(
      (l: LoanVaultTokenAmount) => l.id === routeParams.loanTokenAmount.id,
    );
    if (loanTokenAmount !== undefined) {
      setLoanTokenAmount(loanTokenAmount);
    }
  }, [vaults]);

  const tokens = useSelector((state: RootState) =>
    tokensSelector(state.wallet),
  );
  const toast = useToast();
  const TOAST_DURATION = 2000;
  function showToast(message: string): void {
    toast.hideAll(); // hides old toast everytime user clicks on a new percentage
    toast.show(message, {
      type: "wallet_toast",
      placement: "top",
      duration: TOAST_DURATION,
    });
  }
  const loanToken = useSelector((state: RootState) =>
    loanTokenByTokenId(state.loans, loanTokenAmount.id),
  );
  const { isLight } = useThemeContext();
  const canUseOperations = useLoanOperations(vault?.state);
  // form
  const { control, setValue, formState, trigger, watch } = useForm({
    mode: "onChange",
  });
  const { amountToPay } = watch();
  const collateralDUSD = vault?.collateralAmounts?.find(
    ({ symbol }) => symbol === "DUSD",
  );
  const collateralDUSDAmount = collateralDUSD?.amount ?? "0";
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001));
  const logger = useLogger();

  useEffect(() => {
    client.fee
      .estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(logger.error);
  }, []);

  useEffect(() => {
    if (routeParams.isPaybackDUSDUsingCollateral) {
      setValue(
        "amountToPay",
        BigNumber.min(collateralDUSDAmount, loanTokenAmount.amount).toFixed(8),
      );
    }
  }, [loanTokenAmount, collateralDUSDAmount]);

  const interestPerBlock = useInterestPerBlock(
    new BigNumber(vault?.loanScheme.interestRate ?? NaN),
    new BigNumber(loanToken?.interest ?? NaN),
  );
  const token = tokens?.find((t) => t.id === loanTokenAmount.id);
  const tokenBalance =
    token != null ? getTokenAmount(token.id, tokens) : new BigNumber(0);
  const loanTokenOutstandingBal = new BigNumber(loanTokenAmount.amount);
  const collateralFactor =
    collateralTokens?.find((t) => t.token.id === loanTokenAmount.id)?.factor ??
    "1";
  const loanTokenActivePriceInUSD = getActivePrice(
    loanTokenAmount.symbol,
    loanTokenAmount.activePrice,
    routeParams.isPaybackDUSDUsingCollateral === true
      ? collateralFactor
      : undefined,
    undefined,
    routeParams.isPaybackDUSDUsingCollateral === true
      ? "COLLATERAL"
      : undefined,
  );

  const hasPendingJob = useSelector((state: RootState) =>
    hasTxQueued(state.transactionQueue),
  );
  const hasPendingBroadcastJob = useSelector((state: RootState) =>
    hasOceanTXQueued(state.ocean),
  );

  const getCollateralValue = (collateralValue: string) => {
    if (routeParams.isPaybackDUSDUsingCollateral) {
      // In case of DUSD payment using collateral
      return new BigNumber(collateralValue).minus(
        new BigNumber(amountToPay).multipliedBy(loanTokenActivePriceInUSD),
      );
    }
    return new BigNumber(collateralValue);
  };
  // Resulting col ratio
  const resultingColRatio = useResultingCollateralRatio(
    getCollateralValue(vault?.collateralValue ?? NaN),
    new BigNumber(vault?.loanValue ?? NaN),
    BigNumber.min(
      new BigNumber(amountToPay).isNaN() ? "0" : amountToPay,
      loanTokenAmount.amount,
    ).multipliedBy(-1),
    new BigNumber(loanTokenActivePriceInUSD),
    interestPerBlock,
  );

  const navigateToConfirmScreen = async (): Promise<void> => {
    navigation.navigate({
      name: "ConfirmPaybackLoanScreen",
      params: {
        fee,
        vault,
        tokenBalance,
        loanTokenAmount,
        resultingColRatio,
        loanTokenActivePriceInUSD,
        amountToPay: new BigNumber(amountToPay),
        isPaybackDUSDUsingCollateral: routeParams.isPaybackDUSDUsingCollateral,
      },
      merge: true,
    });
  };

  const onChangeFromAmount = async (
    amount: string,
    type: AmountButtonTypes,
  ): Promise<void> => {
    const isMax = type === AmountButtonTypes.Max;
    const toastMessage = isMax
      ? "Max available {{unit}} entered"
      : "{{percent}} of available {{unit}} entered";
    setValue("amountToPay", amount);
    const toastOption = {
      unit: loanTokenAmount.displaySymbol,
      percent: type,
    };
    showToast(
      translate("screens/PaybackLoanScreen", toastMessage, toastOption),
    );
    await trigger("amountToPay");
  };

  const isContinueDisabled = routeParams.isPaybackDUSDUsingCollateral
    ? new BigNumber(amountToPay).lte(0)
    : !formState.isValid ||
      hasPendingJob ||
      hasPendingBroadcastJob ||
      !canUseOperations;

  return (
    <ThemedScrollViewV2 contentContainerStyle={tailwind("pb-8")}>
      <ThemedTextV2
        style={tailwind("mx-10 text-xs font-normal-v2 mt-8")}
        light={tailwind("text-mono-light-v2-500")}
        dark={tailwind("text-mono-dark-v2-500")}
        testID="payback_loan_title"
      >
        {translate(
          "screens/PaybackLoanScreen",
          routeParams.isPaybackDUSDUsingCollateral
            ? "I WANT TO PAY WITH DUSD COLLATERAL"
            : "I WANT TO PAY",
        )}
      </ThemedTextV2>

      <View style={tailwind("mx-5")}>
        <TransactionCard
          maxValue={tokenBalance}
          onChange={(amount, type) => {
            onChangeFromAmount(amount, type);
          }}
          componentStyle={{
            light: tailwind("bg-transparent"),
            dark: tailwind("bg-transparent"),
          }}
          containerStyle={{
            light: tailwind("bg-transparent"),
            dark: tailwind("bg-transparent"),
          }}
          amountButtonsStyle={{
            light: tailwind("bg-mono-light-v2-00"),
            dark: tailwind("bg-mono-dark-v2-00"),
            style: tailwind("mt-6 rounded-xl-v2"),
          }}
          disabled={new BigNumber(tokenBalance).isZero()}
          showAmountsBtn={!routeParams.isPaybackDUSDUsingCollateral}
        >
          <View
            style={tailwind(
              "flex flex-row justify-between items-center pl-5 mt-4",
            )}
          >
            <View style={tailwind("w-6/12 mr-2")}>
              <Controller
                control={control}
                defaultValue={
                  routeParams.isPaybackDUSDUsingCollateral
                    ? BigNumber.min(
                        collateralDUSDAmount,
                        loanTokenAmount.amount,
                      ).toFixed(8)
                    : ""
                }
                name="amountToPay"
                render={({ field: { onChange, value } }) => (
                  <>
                    {routeParams.isPaybackDUSDUsingCollateral ? (
                      <ThemedTextV2
                        style={tailwind("text-xl font-semibold-v2 w-full")}
                        light={tailwind("text-mono-light-v2-900")}
                        dark={tailwind("text-mono-dark-v2-900")}
                        testID="payback_input_text"
                      >
                        {value}
                      </ThemedTextV2>
                    ) : (
                      <ThemedTextInputV2
                        style={tailwind("text-xl font-semibold-v2 w-full")}
                        light={tailwind("text-mono-light-v2-900")}
                        dark={tailwind("text-mono-dark-v2-900")}
                        keyboardType="numeric"
                        value={value}
                        onBlur={async () => {
                          await onChange(value?.trim());
                        }}
                        onChangeText={async (amount) => {
                          amount = isNaN(+amount) ? "0" : amount;
                          setValue("amountToPay", amount);
                          await trigger("amountToPay");
                        }}
                        placeholder="0.00"
                        placeholderTextColor={getColor(
                          isLight ? "mono-light-v2-500" : "mono-dark-v2-500",
                        )}
                        testID="payback_input_text"
                        editable={amountToPay !== undefined}
                      />
                    )}
                  </>
                )}
                rules={{
                  required: true,
                  pattern: /^\d*\.?\d*$/,
                  validate: {
                    greaterThanZero: (value: string) =>
                      new BigNumber(
                        value !== undefined && value !== "" ? value : 0,
                      ).isGreaterThan(0),
                    notSufficientFunds: (value) =>
                      new BigNumber(tokenBalance).gte(value),
                  },
                }}
              />
              <ActiveUSDValueV2
                price={
                  new BigNumber(amountToPay).isNaN()
                    ? new BigNumber(0)
                    : new BigNumber(amountToPay).multipliedBy(
                        loanTokenActivePriceInUSD,
                      )
                }
                style={tailwind("text-sm")}
                testId="payback_input_value"
                containerStyle={tailwind("w-full break-words")}
              />
            </View>
            <TokenDropdownButton
              tokenId={loanTokenAmount.id}
              symbol={loanTokenAmount.displaySymbol}
              testID="loan_token_symbol"
              status={TokenDropdownButtonStatus.Locked}
            />
          </View>
        </TransactionCard>
        {!routeParams.isPaybackDUSDUsingCollateral && (
          <View style={tailwind("mt-2 mx-5")}>
            <NumberFormat
              displayType="text"
              renderText={(value) => (
                <ThemedTextV2
                  light={tailwind("text-mono-light-v2-500")}
                  dark={tailwind("text-mono-light-v2-500")}
                  style={tailwind("text-xs font-normal-v2")}
                  testID="available_token_balance"
                >
                  {value}
                </ThemedTextV2>
              )}
              prefix={translate("screens/PaybackLoanScreen", "Available: ")}
              suffix={` ${loanTokenAmount.displaySymbol}`}
              thousandSeparator
              value={tokenBalance.toFixed(8)}
            />
          </View>
        )}
        <TransactionDetailsSection
          outstandingBalance={loanTokenOutstandingBal}
          resultingColRatio={resultingColRatio}
          loanTokenAmount={loanTokenAmount}
          collateralValue={getCollateralValue(vault?.collateralValue ?? NaN)}
          vault={vault}
          amountToPay={
            new BigNumber(amountToPay).isNaN()
              ? new BigNumber(0)
              : new BigNumber(amountToPay)
          }
          isPaybackDUSDUsingCollateral={
            routeParams.isPaybackDUSDUsingCollateral
          }
          loanTokenActivePriceInUSD={loanTokenActivePriceInUSD}
          collateralDUSDAmount={collateralDUSDAmount}
        />
      </View>
      <View
        style={[
          tailwind("mx-5"),
          tailwind(isContinueDisabled ? "mt-16" : "mt-12"),
        ]}
      >
        {!isContinueDisabled && (
          <ThemedTextV2
            style={tailwind("text-xs font-normal-v2 text-center")}
            light={tailwind("text-mono-light-v2-500")}
            dark={tailwind("text-mono-dark-v2-500")}
            testID="continue_payback_loan_message"
          >
            {translate(
              "screens/PaybackLoanScreen",
              routeParams.isPaybackDUSDUsingCollateral
                ? "Use your DUSD collaterals to fully pay off your DUSD loan."
                : new BigNumber(loanTokenOutstandingBal).lt(amountToPay)
                ? "Any excess payment will be returned."
                : "Review full details in the next screen",
            )}
          </ThemedTextV2>
        )}
      </View>
      <SubmitButtonGroup
        isDisabled={isContinueDisabled}
        buttonStyle="mx-12 mt-5"
        label={translate("screens/PaybackLoanScreen", "Continue")}
        onSubmit={navigateToConfirmScreen}
        title="payback_loan_continue"
        displayCancelBtn={false}
      />
    </ThemedScrollViewV2>
  );
}

interface TransactionDetailsProps {
  outstandingBalance: BigNumber;
  resultingColRatio: BigNumber;
  vault: LoanVaultActive;
  loanTokenAmount: LoanVaultTokenAmount;
  amountToPay: BigNumber;
  loanTokenActivePriceInUSD: string;
  collateralDUSDAmount?: string;
  isPaybackDUSDUsingCollateral?: boolean;
  collateralValue: BigNumber;
}

function TransactionDetailsSection({
  outstandingBalance,
  resultingColRatio,
  loanTokenAmount,
  vault,
  amountToPay,
  loanTokenActivePriceInUSD,
  collateralDUSDAmount,
  isPaybackDUSDUsingCollateral,
  collateralValue,
}: TransactionDetailsProps): JSX.Element {
  const rowStyle = {
    containerStyle: {
      style: tailwind("flex-row items-start w-full bg-transparent mt-5"),
      light: tailwind("bg-transparent border-mono-light-v2-300"),
      dark: tailwind("bg-transparent border-mono-dark-v2-300"),
    },
    lhsThemedProps: {
      style: tailwind("text-sm font-normal-v2"),
      light: tailwind("text-mono-light-v2-500"),
      dark: tailwind("text-mono-dark-v2-500"),
    },
    rhsThemedProps: {
      style: tailwind("text-sm font-normal-v2"),
      light: tailwind("text-mono-light-v2-900"),
      dark: tailwind("text-mono-dark-v2-900"),
    },
  };
  const loanRemaining = BigNumber.max(
    new BigNumber(outstandingBalance).minus(amountToPay),
    0,
  );
  return (
    <ThemedViewV2
      light={tailwind("border-mono-light-v2-300")}
      dark={tailwind("border-mono-dark-v2-300")}
      style={tailwind("mt-6 px-5 pb-5 border-0.5 rounded-lg-v2")}
    >
      <TextRowV2
        containerStyle={rowStyle.containerStyle}
        lhs={{
          value: translate("screens/PaybackLoanScreen", "Vault ID"),
          testID: "lhs_vault_id",
          themedProps: rowStyle.lhsThemedProps,
        }}
        rhs={{
          value: vault.vaultId,
          testID: "text_vault_id",
          numberOfLines: 1,
          ellipsizeMode: "middle",
          themedProps: rowStyle.rhsThemedProps,
        }}
      />
      <NumberRowV2
        containerStyle={rowStyle.containerStyle}
        lhs={{
          value: translate("screens/PaybackLoanScreen", "Loan remaining"),
          testID: "total_outstanding_loan_label",
          themedProps: rowStyle.lhsThemedProps,
        }}
        rhs={{
          value: loanRemaining.toFixed(8),
          testID: "total_outstanding_loan_value",
          suffix: ` ${loanTokenAmount.displaySymbol}`,
          usdAmount: new BigNumber(loanRemaining).isNaN()
            ? new BigNumber(0)
            : new BigNumber(loanRemaining).multipliedBy(
                loanTokenActivePriceInUSD,
              ),
          themedProps: rowStyle.rhsThemedProps,
        }}
      />

      {isPaybackDUSDUsingCollateral && (
        <NumberRowV2
          containerStyle={rowStyle.containerStyle}
          lhs={{
            value: translate(
              "screens/PaybackLoanScreen",
              "Resulting collateral",
            ),
            testID: "resulting_collateral_amount_label",
            themedProps: rowStyle.lhsThemedProps,
          }}
          rhs={{
            value: new BigNumber(collateralDUSDAmount ?? 0)
              .minus(amountToPay)
              .toFixed(8),
            testID: "resulting_collateral_amount",
            suffix: ` ${loanTokenAmount.displaySymbol}`,
            usdAmount: new BigNumber(
              new BigNumber(collateralDUSDAmount ?? 0).minus(amountToPay),
            ).multipliedBy(loanTokenActivePriceInUSD),
            themedProps: rowStyle.rhsThemedProps,
          }}
        />
      )}

      <CollateralizationRatioDisplay
        collateralizationRatio={resultingColRatio.toFixed(8)}
        minCollateralizationRatio={vault.loanScheme.minColRatio}
        collateralValue={collateralValue.toFixed(8)}
        totalLoanAmount={vault.loanValue}
        testID="text_resulting_col_ratio"
        showProgressBar
      />
    </ThemedViewV2>
  );
}
