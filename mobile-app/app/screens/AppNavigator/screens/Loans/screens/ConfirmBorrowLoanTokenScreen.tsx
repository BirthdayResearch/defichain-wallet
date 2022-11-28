import {
  ThemedScrollViewV2,
  ThemedTextV2,
  ThemedViewV2,
} from "@components/themed";
import { useStyles } from "@tailwind";
import { translate } from "@translations";
import BigNumber from "bignumber.js";
import { Dispatch, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import { hasTxQueued, transactionQueue } from "@store/transaction_queue";
import { hasTxQueued as hasBroadcastQueued } from "@store/ocean";
import { StackScreenProps } from "@react-navigation/stack";
import {
  NativeLoggingProps,
  useLogger,
} from "@shared-contexts/NativeLoggingProvider";
import { WhaleWalletAccount } from "@defichain/whale-api-wallet";
import { CTransactionSegWit } from "@defichain/jellyfish-transaction/dist";
import {
  LoanToken,
  LoanVaultActive,
} from "@defichain/whale-api-client/dist/api/loan";
import { onTransactionBroadcast } from "@api/transaction/transaction_commands";
import { fetchVaults } from "@store/loans";
import { useWalletContext } from "@shared-contexts/WalletContext";
import { useWhaleApiClient } from "@shared-contexts/WhaleContext";
import { getPrecisedCurrencyValue } from "@screens/AppNavigator/screens/Auctions/helpers/precision-token-value";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { SummaryTitle } from "@components/SummaryTitle";
import { useAddressLabel } from "@hooks/useAddressLabel";
import { NumberRowV2 } from "@components/NumberRowV2";
import { TextRowV2 } from "@components/TextRowV2";
import { AddressType } from "@store/wallet";
import { SubmitButtonGroup } from "@components/SubmitButtonGroup";
import { LoanParamList } from "../LoansNavigator";
import { getActivePrice } from "../../Auctions/helpers/ActivePrice";
import { useCollateralizationRatioColor } from "../hooks/CollateralizationRatio";

type Props = StackScreenProps<LoanParamList, "ConfirmBorrowLoanTokenScreen">;

export function ConfirmBorrowLoanTokenScreen({
  route,
  navigation,
}: Props): JSX.Element {
  const {
    loanToken,
    vault,
    borrowAmount,
    annualInterest,
    fee,
    resultingColRatio,
  } = route.params;
  const { tailwind } = useStyles();
  const hasPendingJob = useSelector((state: RootState) =>
    hasTxQueued(state.transactionQueue)
  );
  const hasPendingBroadcastJob = useSelector((state: RootState) =>
    hasBroadcastQueued(state.ocean)
  );
  const dispatch = useAppDispatch();
  const logger = useLogger();
  const { address } = useWalletContext();
  const client = useWhaleApiClient();
  const [isOnPage, setIsOnPage] = useState<boolean>(true);
  const addressLabel = useAddressLabel(address);

  function onCancel(): void {
    navigation.goBack();
  }

  async function onSubmit(): Promise<void> {
    await borrowLoanToken(
      {
        vaultId: vault.vaultId,
        loanToken: loanToken,
        borrowAmount: new BigNumber(borrowAmount),
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

  return (
    <ThemedScrollViewV2 contentContainerStyle={tailwind("px-5 py-8")}>
      <SummaryTitle
        amount={new BigNumber(borrowAmount)}
        title={translate(
          "screens/ConfirmBorrowLoanTokenScreen",
          "You are borrowing"
        )}
        testID="text_borrow_amount"
        iconA={loanToken.token.displaySymbol}
        toAddress={address}
        toAddressLabel={addressLabel}
        addressType={AddressType.WalletAddress}
        customToAddressTitle={translate(
          "screens/ConfirmBorrowLoanTokenScreen",
          "On"
        )}
      />
      <HorizontalRule marginTop="pt-6" />
      <SummaryTransactionDetails
        fee={fee}
        vault={vault}
        resultCollateralRatio={resultingColRatio}
        loanToken={loanToken}
        annualInterest={annualInterest}
        borrowAmount={borrowAmount}
      />
      <HorizontalRule marginTop="" marginBottom="mb-12" />
      <ThemedTextV2
        style={tailwind("text-xs font-normal-v2 mx-7 text-center")}
        light={tailwind("text-mono-light-v2-500")}
        dark={tailwind("text-mono-dark-v2-500")}
      >
        {translate(
          "screens/ConfirmBorrowLoanTokenScreen",
          "Prices may vary during transaction confirmation."
        )}
      </ThemedTextV2>
      <SubmitButtonGroup
        isDisabled={hasPendingJob || hasPendingBroadcastJob}
        label={translate("screens/ConfirmBorrowLoanTokenScreen", "Borrow")}
        onCancel={onCancel}
        onSubmit={onSubmit}
        displayCancelBtn
        buttonStyle="my-5 mx-7"
        title="borrow_loan"
      />
    </ThemedScrollViewV2>
  );
}

function HorizontalRule({
  marginTop = "mt-5",
  marginBottom = "mb-5",
}: {
  marginTop?: string;
  marginBottom?: string;
}): JSX.Element {
  const { tailwind } = useStyles();
  return (
    <ThemedViewV2
      style={tailwind(`border-b-0.5 ${marginTop} ${marginBottom}`)}
      light={tailwind("border-mono-light-v2-200")}
      dark={tailwind("border-mono-dark-v2-200")}
    />
  );
}

interface SummaryTransactionDetailsProps {
  fee: BigNumber;
  vault: LoanVaultActive;
  resultCollateralRatio: BigNumber;
  loanToken: LoanToken;
  annualInterest: BigNumber;
  borrowAmount: string;
}

function SummaryTransactionDetails(
  props: SummaryTransactionDetailsProps
): JSX.Element {
  const { tailwind } = useStyles();
  const borrowAmountUSD = new BigNumber(props.borrowAmount).multipliedBy(
    getActivePrice(props.loanToken.token.symbol, props.loanToken.activePrice)
  );
  const { light, dark } = useCollateralizationRatioColor({
    colRatio: props.resultCollateralRatio,
    minColRatio: new BigNumber(props.vault.loanScheme.minColRatio),
    totalLoanAmount: new BigNumber(props.vault.loanValue).plus(borrowAmountUSD),
  });
  return (
    <>
      <NumberRowV2
        lhs={{
          value: translate(
            "screens/ConfirmBorrowLoanTokenScreen",
            "Transaction fee"
          ),
          testID: "transaction_fee",
          themedProps: {
            light: tailwind("text-mono-light-v2-500"),
            dark: tailwind("text-mono-dark-v2-500"),
          },
        }}
        rhs={{
          value: props.fee.toFixed(8),
          testID: "transaction_fee_value",
          suffix: " DFI",
        }}
      />
      <HorizontalRule marginTop="pb-5" />
      <TextRowV2
        lhs={{
          value: translate("screens/ConfirmBorrowLoanTokenScreen", "Vault"),
          testID: "vault",
          themedProps: {
            light: tailwind("text-mono-light-v2-500"),
            dark: tailwind("text-mono-dark-v2-500"),
          },
        }}
        rhs={{
          value: props.vault.vaultId,
          testID: "vault_id_value",
          ellipsizeMode: "middle",
          numberOfLines: 1,
        }}
      />
      <NumberRowV2
        lhs={{
          value: translate(
            "screens/ConfirmBorrowLoanTokenScreen",
            "Collateral ratio"
          ),
          testID: "col_ratio",
          themedProps: {
            light: tailwind("text-mono-light-v2-500"),
            dark: tailwind("text-mono-dark-v2-500"),
          },
        }}
        rhs={{
          value: props.resultCollateralRatio.toFixed(2),
          testID: "col_ratio_value",
          suffix: "%",
          themedProps: {
            light: light,
            dark: dark,
          },
        }}
        containerStyle={{
          style: tailwind("flex-row items-start w-full bg-transparent pt-5"),
        }}
      />
      <HorizontalRule />
      <NumberRowV2
        lhs={{
          value: translate("screens/ConfirmBorrowLoanTokenScreen", "Price"),
          testID: "price",
          themedProps: {
            light: tailwind("text-mono-light-v2-500"),
            dark: tailwind("text-mono-dark-v2-500"),
          },
        }}
        rhs={{
          value: getPrecisedCurrencyValue(
            getActivePrice(
              props.loanToken.token.symbol,
              props.loanToken.activePrice
            )
          ),
          testID: "price_value",
          prefix: "$",
          themedProps: {
            style: tailwind("font-normal-v2 text-sm"),
          },
          subValue: {
            value: props.loanToken.interest ?? 0,
            suffix: translate("screens/BorrowLoanTokenScreen", "% interest"),
            testID: "price_interest_rate",
          },
        }}
      />
      <NumberRowV2
        lhs={{
          value: translate("screens/BorrowLoanTokenScreen", "Annual interest"),
          testID: "estimated_annual_interest",
          themedProps: {
            light: tailwind("text-mono-light-v2-500"),
            dark: tailwind("text-mono-dark-v2-500"),
          },
        }}
        rhs={{
          value: props.annualInterest.isNaN()
            ? new BigNumber(0).toFixed(8)
            : props.annualInterest.toFixed(8),
          testID: "estimated_annual_interest",
          suffix: ` ${props.loanToken.token.displaySymbol}`,
          themedProps: {
            style: tailwind("font-normal-v2 text-sm"),
          },
          usdAmount: props.annualInterest.isNaN()
            ? new BigNumber(0)
            : props.annualInterest.multipliedBy(
                getActivePrice(
                  props.loanToken.token.symbol,
                  props.loanToken.activePrice
                )
              ),
          usdTextStyle: tailwind("text-sm mt-1"),
        }}
        containerStyle={{
          style: tailwind("flex-row items-start w-full bg-transparent pt-5"),
        }}
      />
      <NumberRowV2
        lhs={{
          value: translate(
            "screens/ConfirmBorrowLoanTokenScreen",
            "Amount to borrow"
          ),
          testID: "tokens_to_borrow",
          themedProps: {
            light: tailwind("text-mono-light-v2-500"),
            dark: tailwind("text-mono-dark-v2-500"),
          },
        }}
        rhs={{
          value: props.borrowAmount,
          testID: "tokens_to_borrow",
          suffix: ` ${props.loanToken.token.displaySymbol}`,
          themedProps: {
            style: tailwind("font-semibold-v2 text-sm"),
          },
          usdAmount: borrowAmountUSD,
          usdTextStyle: tailwind("text-sm mt-1"),
        }}
      />
    </>
  );
}

interface BorrowForm {
  vaultId: string;
  borrowAmount: BigNumber;
  loanToken: LoanToken;
}

async function borrowLoanToken(
  { vaultId, borrowAmount, loanToken }: BorrowForm,
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
      const signed = await builder.loans.takeLoan(
        {
          vaultId: vaultId,
          to: script,
          tokenAmounts: [
            {
              token: +loanToken.token.id,
              amount: borrowAmount,
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
          "screens/OceanInterface",
          "Borrowing {{amount}} {{symbol}} with vault {{vaultId}}",
          {
            amount: borrowAmount.toFixed(8),
            symbol: loanToken.token.displaySymbol,
            vaultId: `${vaultId.slice(0, 4)}...${vaultId.slice(
              vaultId.length - 4,
              vaultId.length
            )}`,
          }
        ),
        drawerMessages: {
          preparing: translate("screens/OceanInterface", "Preparing loan…"),
          waiting: translate(
            "screens/OceanInterface",
            "Borrowing {{amount}} {{symbol}}",
            {
              amount: borrowAmount.toFixed(8),
              symbol: loanToken.token.displaySymbol,
            }
          ),
          complete: translate(
            "screens/OceanInterface",
            "Borrowed {{amount}} {{symbol}}",
            {
              amount: borrowAmount.toFixed(8),
              symbol: loanToken.token.displaySymbol,
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
