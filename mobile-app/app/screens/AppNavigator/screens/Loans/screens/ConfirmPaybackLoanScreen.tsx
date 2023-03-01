import { View } from "react-native";
import {
  ThemedScrollViewV2,
  ThemedTextV2,
  ThemedViewV2,
} from "@components/themed";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import BigNumber from "bignumber.js";
import { Dispatch, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import {
  hasTxQueued,
  hasOceanTXQueued,
  transactionQueue,
} from "@waveshq/walletkit-ui/dist/store";
import { StackScreenProps } from "@react-navigation/stack";
import {
  NativeLoggingProps,
  useLogger,
} from "@shared-contexts/NativeLoggingProvider";
import { WhaleWalletAccount } from "@defichain/whale-api-wallet";
import { CTransactionSegWit } from "@defichain/jellyfish-transaction/dist";
import { LoanVaultTokenAmount } from "@defichain/whale-api-client/dist/api/loan";
import { onTransactionBroadcast } from "@api/transaction/transaction_commands";
import { fetchVaults } from "@store/loans";
import { useWalletContext } from "@shared-contexts/WalletContext";
import { useWhaleApiClient } from "@waveshq/walletkit-ui/dist/contexts";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { SummaryTitle } from "@components/SummaryTitle";
import { useAddressLabel } from "@hooks/useAddressLabel";
import { NumberRowV2 } from "@components/NumberRowV2";
import { TextRowV2 } from "@components/TextRowV2";
import { SubmitButtonGroup } from "@components/SubmitButtonGroup";
import { LoanParamList } from "../LoansNavigator";
import { CollateralizationRatioDisplay } from "../components/CollateralizationRatioDisplay";

type Props = StackScreenProps<LoanParamList, "ConfirmPaybackLoanScreen">;

export function ConfirmPaybackLoanScreen({
  route,
  navigation,
}: Props): JSX.Element {
  const {
    fee,
    vault,
    amountToPay,
    tokenBalance,
    loanTokenAmount,
    resultingColRatio,
    isPaybackDUSDUsingCollateral,
    loanTokenActivePriceInUSD,
  } = route.params;
  const hasPendingJob = useSelector((state: RootState) =>
    hasTxQueued(state.transactionQueue)
  );
  const hasPendingBroadcastJob = useSelector((state: RootState) =>
    hasOceanTXQueued(state.ocean)
  );
  const dispatch = useAppDispatch();
  const { address } = useWalletContext();
  const client = useWhaleApiClient();
  const [isOnPage, setIsOnPage] = useState<boolean>(true);
  const logger = useLogger();

  function onCancel(): void {
    navigation.navigate({
      name: "PaybackLoanScreen",
      params: {
        loanTokenAmount,
        vault,
      },
      merge: true,
    });
  }

  async function onSubmit(): Promise<void> {
    await paybackLoanToken(
      {
        vaultId: vault.vaultId,
        amountToPay,
        loanToken: loanTokenAmount,
        tokenBalance,
        isPaybackDUSDUsingCollateral,
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

  useEffect(() => {
    setIsOnPage(true);
    return () => {
      setIsOnPage(false);
    };
  }, []);

  const addressLabel = useAddressLabel(address);
  const loanRemaining = BigNumber.max(
    0,
    new BigNumber(loanTokenAmount.amount).minus(amountToPay)
  );
  return (
    <ThemedScrollViewV2 style={tailwind("pb-4")}>
      <ThemedViewV2 style={tailwind("flex-col px-5 py-8")}>
        <SummaryTitle
          amount={amountToPay}
          title={translate(
            "screens/ConfirmPaybackLoanScreen",
            "You are paying"
          )}
          testID="text_send_amount"
          iconA={loanTokenAmount.displaySymbol}
          amountTextStyle="text-xl"
          fromAddress={address}
          fromAddressLabel={addressLabel}
        />

        <NumberRowV2
          containerStyle={{
            style: tailwind(
              "flex-row items-start w-full bg-transparent border-t-0.5 py-5 mt-6"
            ),
            light: tailwind("bg-transparent border-mono-light-v2-300"),
            dark: tailwind("bg-transparent border-mono-dark-v2-300"),
          }}
          lhs={{
            value: translate(
              "screens/ConfirmPaybackLoanScreen",
              "Transaction fee"
            ),
            testID: "transaction_fee",
            themedProps: {
              light: tailwind("text-mono-light-v2-500"),
              dark: tailwind("text-mono-dark-v2-500"),
            },
          }}
          rhs={{
            value: fee.toFixed(8),
            suffix: " DFI",
            testID: "transaction_fee_value",
            themedProps: {
              light: tailwind("text-mono-light-v2-900"),
              dark: tailwind("text-mono-dark-v2-900"),
            },
          }}
        />

        <TextRowV2
          containerStyle={{
            style: tailwind(
              "flex-row items-start w-full bg-transparent border-t-0.5 pt-5"
            ),
            light: tailwind("bg-transparent border-mono-light-v2-300"),
            dark: tailwind("bg-transparent border-mono-dark-v2-300"),
          }}
          lhs={{
            value: translate("screens/ConfirmPaybackLoanScreen", "Vault ID"),
            testID: "text_vault_id",
            themedProps: {
              light: tailwind("text-mono-light-v2-500"),
              dark: tailwind("text-mono-dark-v2-500"),
            },
          }}
          rhs={{
            value: vault.vaultId,
            testID: "vault_id",
            numberOfLines: 1,
            ellipsizeMode: "middle",
            themedProps: {
              light: tailwind("text-mono-light-v2-900"),
              dark: tailwind("text-mono-dark-v2-900"),
            },
          }}
        />

        <View style={tailwind("my-5")}>
          <CollateralizationRatioDisplay
            collateralizationRatio={resultingColRatio.toFixed(8)}
            minCollateralizationRatio={vault.loanScheme.minColRatio}
            collateralValue={vault.collateralValue}
            totalLoanAmount={vault.loanValue}
            testID="text_resulting_col_ratio"
          />
        </View>

        <NumberRowV2
          containerStyle={{
            style: tailwind(
              "flex-row items-start w-full bg-transparent border-t-0.5 pt-5"
            ),
            light: tailwind("bg-transparent border-mono-light-v2-300"),
            dark: tailwind("bg-transparent border-mono-dark-v2-300"),
          }}
          lhs={{
            value: translate(
              "screens/ConfirmPaybackLoanScreen",
              "Loan remaining"
            ),
            testID: "text_resulting_loan_amount",
            themedProps: {
              light: tailwind("text-mono-light-v2-500"),
              dark: tailwind("text-mono-dark-v2-500"),
            },
          }}
          rhs={{
            value: loanRemaining.toFixed(8),
            suffix: ` ${loanTokenAmount.displaySymbol}`,
            testID: "resulting_loan_amount",
            usdAmount: new BigNumber(loanRemaining).multipliedBy(
              loanTokenActivePriceInUSD
            ),
            themedProps: {
              light: tailwind("text-mono-light-v2-900"),
              dark: tailwind("text-mono-dark-v2-900"),
            },
          }}
        />

        <NumberRowV2
          containerStyle={{
            style: tailwind(
              "flex-row items-start w-full bg-transparent border-b-0.5"
            ),
            light: tailwind("bg-transparent border-mono-light-v2-300"),
            dark: tailwind("bg-transparent border-mono-dark-v2-300"),
          }}
          lhs={{
            value: translate(
              "screens/ConfirmPaybackLoanScreen",
              "Amount to pay"
            ),
            testID: "text_tokens_to_pay",
            themedProps: {
              light: tailwind("text-mono-light-v2-500"),
              dark: tailwind("text-mono-dark-v2-500"),
            },
          }}
          rhs={{
            value: amountToPay.toFixed(8),
            suffix: ` ${loanTokenAmount.displaySymbol}`,
            testID: "tokens_to_pay",
            usdAmount: new BigNumber(amountToPay).multipliedBy(
              loanTokenActivePriceInUSD
            ),
            themedProps: {
              style: tailwind("text-right text-sm font-semibold-v2"),
              light: tailwind("text-mono-light-v2-900"),
              dark: tailwind("text-mono-dark-v2-900"),
            },
          }}
        />

        <View style={tailwind("mt-12")}>
          <ThemedTextV2
            style={tailwind("text-xs font-normal-v2 text-center mb-5")}
            light={tailwind("text-mono-light-v2-500")}
            dark={tailwind("text-mono-dark-v2-500")}
            testID="confirm_payback_loan_message"
          >
            {translate(
              "screens/ConfirmPaybackLoanScreen",
              "Prices may vary during transaction confirmation."
            )}
          </ThemedTextV2>
          <SubmitButtonGroup
            isDisabled={hasPendingJob || hasPendingBroadcastJob}
            label={translate(
              "screens/ConfirmPaybackLoanScreen",
              "Payback loan"
            )}
            onCancel={onCancel}
            onSubmit={onSubmit}
            displayCancelBtn
            buttonStyle="mx-7 mb-4"
            title="payback_loan"
          />
        </View>
      </ThemedViewV2>
    </ThemedScrollViewV2>
  );
}

interface PaybackForm {
  vaultId: string;
  amountToPay: BigNumber;
  tokenBalance: BigNumber;
  loanToken: LoanVaultTokenAmount;
  isPaybackDUSDUsingCollateral?: boolean;
}

async function paybackLoanToken(
  {
    vaultId,
    amountToPay,
    tokenBalance,
    loanToken,
    isPaybackDUSDUsingCollateral,
  }: PaybackForm,
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
      const signed = await builder.loans.paybackLoan(
        {
          vaultId: vaultId,
          from: script,
          tokenAmounts: [
            {
              token: +loanToken.id,
              amount: isPaybackDUSDUsingCollateral
                ? new BigNumber("9999999999.99999999")
                : BigNumber.min(tokenBalance, amountToPay),
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
          "screens/ConfirmPaybackLoanScreen",
          "Paying {{amountToPay}} {{symbol}}",
          {
            amountToPay: amountToPay.toFixed(8),
            symbol: loanToken.displaySymbol,
          }
        ),
        drawerMessages: {
          preparing: translate(
            "screens/OceanInterface",
            "Preparing loan payment…"
          ),
          waiting: translate(
            "screens/ConfirmPaybackLoanScreen",
            "Paying {{amountToPay}} {{symbol}}",
            {
              amountToPay: amountToPay.toFixed(8),
              symbol: loanToken.displaySymbol,
            }
          ),
          complete: translate(
            "screens/ConfirmPaybackLoanScreen",
            "Paid {{amountToPay}} {{symbol}}",
            {
              amountToPay: amountToPay.toFixed(8),
              symbol: loanToken.displaySymbol,
            }
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
