import BigNumber from "bignumber.js";
import {
  ThemedIcon,
  ThemedText,
  ThemedView,
  ThemedTextV2,
  ThemedViewV2,
} from "@components/themed";
import { tailwind } from "@tailwind";
import { SymbolIcon } from "@components/SymbolIcon";
import { translate } from "@translations";
import { fetchVaults, LoanVault } from "@store/loans";
import {
  LoanVaultActive,
  LoanVaultState,
  LoanVaultTokenAmount,
} from "@defichain/whale-api-client/dist/api/loan";
import { LinearGradient } from "expo-linear-gradient";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { LoanParamList } from "@screens/AppNavigator/screens/Loans/LoansNavigator";
import { useLoanOperations } from "@screens/AppNavigator/screens/Loans/hooks/LoanOperations";
import { getActivePrice } from "@screens/AppNavigator/screens/Auctions/helpers/ActivePrice";
import { BottomSheetNavScreen } from "@components/BottomSheetWithNav";
import { Text, TouchableOpacity, View } from "react-native";
import { SubmitButtonGroup } from "@components/SubmitButtonGroup";
import { memo, useState, useEffect } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { NumericFormat as NumberFormat } from "react-number-format";
import { getPrecisedTokenValue } from "@screens/AppNavigator/screens/Auctions/helpers/precision-token-value";
import { Dispatch } from "@reduxjs/toolkit";
import { WhaleWalletAccount } from "@defichain/whale-api-wallet";
import { CTransactionSegWit } from "@defichain/jellyfish-transaction/dist";
import {
  NativeLoggingProps,
  useLogger,
} from "@shared-contexts/NativeLoggingProvider";
import { onTransactionBroadcast } from "@api/transaction/transaction_commands";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { hasTxQueued as hasBroadcastQueued } from "@store/ocean";
import { hasTxQueued, transactionQueue } from "@store/transaction_queue";
import { useWalletContext } from "@shared-contexts/WalletContext";
import { useWhaleApiClient } from "@shared-contexts/WhaleContext";
import { useFeatureFlagContext } from "@contexts/FeatureFlagContext";
import { IconTooltip } from "@components/tooltip/IconTooltip";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import { LoanActionButton } from "@screens/AppNavigator/screens/Loans/components/LoanActionButton";

interface LoanCardProps {
  symbol: string;
  displaySymbol: string;
  amount: string;
  interestAmount?: string;
  vaultState: LoanVaultState;
  vault?: LoanVaultActive;
  loanToken: LoanVaultTokenAmount;
  dismissModal: () => void;
  expandModal: () => void;
  setBottomSheetScreen: (val: BottomSheetNavScreen[]) => void;
}

export function VaultDetailLoansRow(props: {
  vault: LoanVault;
  dismissModal: () => void;
  expandModal: () => void;
  setBottomSheetScreen: (val: BottomSheetNavScreen[]) => void;
}): JSX.Element {
  const { vault, dismissModal, expandModal, setBottomSheetScreen } = props;
  return (
    <ThemedViewV2 style={tailwind("mx-5 mt-6")}>
      {vault.state === LoanVaultState.IN_LIQUIDATION &&
        vault.batches.map((batch) => (
          <LoanCard
            key={batch.loan.id}
            symbol={batch.loan.id}
            displaySymbol={batch.loan.displaySymbol}
            amount={batch.loan.amount}
            vaultState={LoanVaultState.IN_LIQUIDATION}
            loanToken={batch.loan}
            dismissModal={dismissModal}
            expandModal={expandModal}
            setBottomSheetScreen={setBottomSheetScreen}
          />
        ))}

      {vault.state !== LoanVaultState.IN_LIQUIDATION &&
        vault.loanValue !== "0" && (
          <ThemedTextV2
            light={tailwind("text-mono-light-v2-500")}
            dark={tailwind("text-mono-dark-v2-500")}
            style={tailwind("text-xs font-normal-v2 mb-2 px-5")}
          >
            {translate("screens/VaultDetailScreenLoansSection", "LOANS")}
          </ThemedTextV2>
        )}

      {vault.state !== LoanVaultState.IN_LIQUIDATION &&
        vault.loanAmounts.map((loan) => (
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
            loanToken={loan}
            dismissModal={dismissModal}
            expandModal={expandModal}
            setBottomSheetScreen={setBottomSheetScreen}
          />
        ))}
    </ThemedViewV2>
  );
}

function LoanCard(props: LoanCardProps): JSX.Element {
  const navigation = useNavigation<NavigationProp<LoanParamList>>();
  const canUseOperations = useLoanOperations(props.vault?.state);
  const activePrice = new BigNumber(
    getActivePrice(props.symbol, props.loanToken.activePrice)
  );

  const { isFeatureAvailable } = useFeatureFlagContext();

  return (
    <TouchableOpacity
      style={tailwind("mb-2")}
      onPress={() => {
        navigation.navigate({
          name: "BorrowMoreScreen",
          merge: true,
          params: {
            vault: props.vault,
            loanTokenAmount: props.loanToken,
          },
        });
      }}
    >
      <ThemedViewV2
        light={tailwind("bg-mono-light-v2-00")}
        dark={tailwind("bg-mono-dark-v2-00")}
        style={tailwind(
          "py-4 px-5 flex flex-row items-center justify-between",
          { "rounded-t-lg-v2": props.displaySymbol === "DUSD" },
          { "rounded-lg-v2": props.displaySymbol !== "DUSD" }
        )}
      >
        <View style={tailwind("flex flex-row items-center")}>
          <SymbolIcon
            symbol={props.displaySymbol}
            styleHeight={36}
            styleWidth={36}
          />
          {/* eslint-disable react-native/no-raw-text */}
          <View style={tailwind("ml-2")}>
            <ThemedTextV2
              light={tailwind({
                "text-gray-300":
                  props.vaultState === LoanVaultState.IN_LIQUIDATION,
                "text-mono-light-v2-900":
                  props.vaultState !== LoanVaultState.IN_LIQUIDATION,
              })}
              dark={tailwind({
                "text-gray-700":
                  props.vaultState === LoanVaultState.IN_LIQUIDATION,
                "text-mono-dark-v2-900":
                  props.vaultState !== LoanVaultState.IN_LIQUIDATION,
              })}
              style={tailwind("text-sm font-semibold-v2")}
              testID={`loan_card_${props.displaySymbol}`}
            >
              {`${new BigNumber(props.amount).toFixed(8)} ${
                props.displaySymbol
              }`}
            </ThemedTextV2>
            <ThemedTextV2
              light={tailwind("text-mono-light-v2-700")}
              dark={tailwind("text-mono-dark-v2-700")}
              style={tailwind("text-xs font-normal-v2")}
            >
              {new BigNumber(props.interestAmount ?? 0).toFixed(8)}{" "}
              {translate(
                "screens/VaultDetailScreenLoansSection",
                "as interest"
              )}
            </ThemedTextV2>
          </View>
        </View>

        {props.vault !== undefined && (
          <LoanActionButton
            label={translate("components/VaultDetailScreenLoansSection", "Pay")}
            disabled={!canUseOperations}
            onPress={() => {
              navigation.navigate({
                name: "PaybackLoanScreen",
                merge: true,
                params: {
                  vault: props.vault,
                  loanTokenAmount: props.loanToken,
                },
              });
            }}
            testID={`pay_${props.displaySymbol}_loan`}
          />
        )}
      </ThemedViewV2>
      {props.vault !== undefined &&
        props.displaySymbol === "DUSD" &&
        isFeatureAvailable("unloop_dusd") && (
          <LoanActionDUSDButton
            vault={props.vault}
            paybackAmount={new BigNumber(props.loanToken.amount)}
            activePrice={activePrice}
            loanToken={props.loanToken}
            dismissModal={props.dismissModal}
            expandModal={props.expandModal}
            setBottomSheetScreen={props.setBottomSheetScreen}
          />
        )}
    </TouchableOpacity>
  );
}

function LoanActionDUSDButton({
  loanToken,
  vault,
  dismissModal,
  expandModal,
  setBottomSheetScreen,
  paybackAmount,
  activePrice,
}: {
  vault: LoanVaultActive;
  loanToken: LoanVaultTokenAmount;
  paybackAmount: BigNumber;
  activePrice: BigNumber;
  dismissModal: () => void;
  expandModal: () => void;
  setBottomSheetScreen: (val: BottomSheetNavScreen[]) => void;
}): JSX.Element {
  const dispatch = useAppDispatch();
  const logger = useLogger();
  const [isOnPage, setIsOnPage] = useState<boolean>(true);
  const navigation = useNavigation<NavigationProp<LoanParamList>>();
  const { address } = useWalletContext();
  const client = useWhaleApiClient();
  const collateralDUSDAmount =
    vault?.collateralAmounts?.find(({ symbol }) => symbol === "DUSD")?.amount ??
    0;

  async function onSubmit(): Promise<void> {
    if (vault !== undefined) {
      await paybackLoanToken(
        {
          loanToken,
          vaultId: vault?.vaultId,
          amount: BigNumber.min(collateralDUSDAmount, paybackAmount),
        },
        dispatch,
        () => {
          onTransactionBroadcast(isOnPage, navigation.dispatch);
        },
        () => {
          dispatch(
            fetchVaults({
              address,
              client,
            })
          );
        },
        logger
      );
    }
  }

  useEffect(() => {
    setIsOnPage(true);
    return () => {
      setIsOnPage(false);
    };
  }, []);

  const onPaybackDUSD = (): void => {
    const amount = BigNumber.min(collateralDUSDAmount, paybackAmount);
    setBottomSheetScreen([
      {
        stackScreenName: "Payback DUSD",
        option: {
          header: () => null,
          headerBackTitleVisible: false,
        },
        component: PaybackDUSD({
          onSubmit,
          paybackAmount: amount,
          paybackValue: new BigNumber(amount).multipliedBy(activePrice),
          onCloseButtonPress: dismissModal,
        }),
      },
    ]);
    expandModal();
  };
  return (
    <LinearGradient
      start={[0, 0]}
      end={[1, 1]}
      colors={[
        "#FF01AF",
        "#FB01AF",
        "#EF01B1",
        "#DB02B5",
        "#C004BA",
        "#9D06C0",
        "#7208C8",
        "#3F0BD1",
        "#0E0EDB",
      ]}
      locations={[0, 0.13, 0.26, 0.39, 0.52, 0.64, 0.77, 0.89, 1]}
      style={tailwind("py-2 rounded-b-lg-v2")}
    >
      <TouchableOpacity
        // testID="loan_card_DUSD_payback_dusd_loan"
        testID="pay_dusd_loan"
        onPress={onPaybackDUSD}
        activeOpacity={0.7}
      >
        <ThemedTextV2
          light={tailwind("text-mono-dark-v2-900")}
          dark={tailwind("text-mono-dark-v2-900")}
          style={tailwind("text-sm font-semibold-v2 text-center")}
        >
          {translate(
            "screens/VaultDetailScreenLoansSection",
            "Pay with DUSD collaterals"
          )}
        </ThemedTextV2>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const PaybackDUSD = ({
  onCloseButtonPress,
  paybackAmount,
  paybackValue,
  onSubmit,
}: {
  onCloseButtonPress: () => void;
  paybackAmount: BigNumber;
  paybackValue: BigNumber;
  onSubmit: () => Promise<void>;
}): React.MemoExoticComponent<() => JSX.Element> =>
  memo(() => {
    const hasPendingJob = useSelector((state: RootState) =>
      hasTxQueued(state.transactionQueue)
    );
    const hasPendingBroadcastJob = useSelector((state: RootState) =>
      hasBroadcastQueued(state.ocean)
    );
    return (
      <ThemedView
        light={tailwind("bg-white")}
        dark={tailwind("bg-gray-800")}
        style={tailwind("h-full flex")}
      >
        <View style={tailwind("px-4 pt-4")}>
          <View style={tailwind("font-medium w-full mb-2 items-end")}>
            <TouchableOpacity
              onPress={onCloseButtonPress}
              testID="payback_close_button"
            >
              <ThemedIcon
                size={24}
                name="close"
                iconType="MaterialIcons"
                dark={tailwind("text-white text-opacity-70")}
                light={tailwind("text-gray-700")}
              />
            </TouchableOpacity>
          </View>
        </View>
        <ThemedView
          light={tailwind("bg-white")}
          dark={tailwind("bg-gray-800")}
          style={tailwind("flex-1")}
        >
          <ScrollView contentContainerStyle={tailwind("pb-8")}>
            <View style={tailwind("px-4")}>
              <View>
                <ThemedText
                  dark={tailwind("text-gray-50")}
                  light={tailwind("text-gray-900")}
                  style={tailwind("text-xs text-center mb-1")}
                >
                  {translate("components/QuickBid", "Paying loan")}
                </ThemedText>
                <NumberFormat
                  value={paybackAmount.toFixed(8)}
                  thousandSeparator
                  suffix=" DUSD"
                  displayType="text"
                  renderText={(value) => (
                    <ThemedText
                      dark={tailwind("text-gray-50")}
                      light={tailwind("text-gray-900")}
                      style={tailwind(
                        "text-lg flex-wrap font-medium text-center"
                      )}
                      testID="dusd_payback_amount"
                    >
                      {value}
                    </ThemedText>
                  )}
                />
                <NumberFormat
                  decimalScale={8}
                  prefix="≈ $"
                  displayType="text"
                  renderText={(value) => (
                    <View
                      style={tailwind(
                        "flex flex-row justify-center items-center"
                      )}
                    >
                      <ThemedText
                        dark={tailwind("text-gray-50")}
                        light={tailwind("text-gray-900")}
                        style={tailwind(
                          "text-2xs flex-wrap text-center leading-4"
                        )}
                        testID="dusd_payback_value"
                      >
                        {value}
                      </ThemedText>
                      <IconTooltip />
                    </View>
                  )}
                  thousandSeparator
                  value={getPrecisedTokenValue(paybackValue)}
                />
              </View>
              <Text style={tailwind("text-sm text-center mt-6 text-orange-v2")}>
                {translate(
                  "components/PaybackDUSD",
                  "Are you sure you want to payback your DUSD loan with all available DUSD collateral in this vault?"
                )}
              </Text>
              <View style={tailwind("-mt-3 -mx-4")}>
                <SubmitButtonGroup
                  isDisabled={hasPendingJob || hasPendingBroadcastJob}
                  label={translate(
                    "components/PaybackDUSD",
                    "Payback with DUSD collateral"
                  )}
                  processingLabel={translate(
                    "components/PaybackDUSD",
                    "Payback with DUSD collateral"
                  )}
                  onSubmit={onSubmit}
                  title="payback_loan_continue"
                  isProcessing={hasPendingJob || hasPendingBroadcastJob}
                  displayCancelBtn={false}
                />
              </View>
            </View>
          </ScrollView>
        </ThemedView>
      </ThemedView>
    );
  });

async function paybackLoanToken(
  {
    vaultId,
    amount,
    loanToken,
  }: {
    vaultId: string;
    amount: BigNumber;
    loanToken: LoanVaultTokenAmount;
  },
  dispatch: Dispatch<any>,
  onBroadcast: () => void,
  onConfirmation: () => void,
  logger: NativeLoggingProps
): Promise<void> {
  try {
    const signer = async (
      account: WhaleWalletAccount
    ): Promise<CTransactionSegWit> => {
      const script = await account.getScript();
      const builder = account.withTransactionBuilder();
      // TODO (Harsh) update api for payback loan
      const signed = await builder.loans.paybackLoan(
        {
          vaultId: vaultId,
          from: script,
          tokenAmounts: [
            {
              token: +loanToken.id,
              // To payback DUSD loan with collateral set amount to 9999999999.99999999
              amount: new BigNumber("9999999999.99999999"),
            },
          ],
        },
        script
      );
      return new CTransactionSegWit(signed);
    };

    dispatch(
      transactionQueue.actions.push({
        sign: signer,
        title: translate(
          "components/PaybackDUSD",
          "Paying {{amountToPayInPaymentToken}} DUSD loan with DUSD collateral",
          {
            amountToPayInPaymentToken: amount.toFixed(8),
          }
        ),
        drawerMessages: {
          preparing: translate(
            "screens/OceanInterface",
            "Preparing loan payment…"
          ),
          waiting: translate(
            "screens/OceanInterface",
            "Paying back loan amount of {{amount}} DUSD",
            { amount }
          ),
          complete: translate(
            "screens/OceanInterface",
            "Paid loan amount of {{amount}} DUSD",
            { amount }
          ),
        },
        onBroadcast,
        onConfirmation,
      })
    );
  } catch (e) {
    logger.error(e);
  }
}
