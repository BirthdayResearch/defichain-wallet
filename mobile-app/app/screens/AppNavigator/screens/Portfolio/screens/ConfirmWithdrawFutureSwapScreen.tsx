import { InfoRow, InfoType } from "@components/InfoRow";
import { NumberRow } from "@components/NumberRow";
import { SummaryTitle } from "@components/SummaryTitle";
import { TextRow } from "@components/TextRow";
import {
  ThemedScrollView,
  ThemedSectionTitle,
  ThemedView,
} from "@components/themed";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import BigNumber from "bignumber.js";
import { Dispatch, useEffect, useState } from "react";
import { SubmitButtonGroup } from "@components/SubmitButtonGroup";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import { hasTxQueued, transactionQueue } from "@store/transaction_queue";
import { hasTxQueued as hasBroadcastQueued } from "@store/ocean";
import { StackScreenProps } from "@react-navigation/stack";
import { WalletAddressRow } from "@components/WalletAddressRow";
import {
  NativeLoggingProps,
  useLogger,
} from "@shared-contexts/NativeLoggingProvider";
import { WhaleWalletAccount } from "@defichain/whale-api-wallet";
import { CTransactionSegWit } from "@defichain/jellyfish-transaction/dist";
import { onTransactionBroadcast } from "@api/transaction/transaction_commands";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { useFutureSwapDate } from "../../Dex/hook/FutureSwap";
import { PortfolioParamList } from "../PortfolioNavigator";

type Props = StackScreenProps<
  PortfolioParamList,
  "ConfirmWithdrawFutureSwapScreen"
>;

export function ConfirmWithdrawFutureSwapScreen({
  route,
  navigation,
}: Props): JSX.Element {
  const { source, destination, fee, executionBlock } = route.params;
  const hasPendingJob = useSelector((state: RootState) =>
    hasTxQueued(state.transactionQueue)
  );
  const hasPendingBroadcastJob = useSelector((state: RootState) =>
    hasBroadcastQueued(state.ocean)
  );
  const blockCount = useSelector((state: RootState) => state.block.count ?? 0);
  const { isEnded } = useFutureSwapDate(executionBlock, blockCount);
  const dispatch = useAppDispatch();
  const logger = useLogger();
  const [isOnPage, setIsOnPage] = useState<boolean>(true);

  function onCancel(): void {
    navigation.goBack();
  }

  async function onSubmit(): Promise<void> {
    await withdrawFutureSwap(
      {
        source,
        destination,
        fee,
      },
      dispatch,
      () => {
        onTransactionBroadcast(isOnPage, navigation.dispatch);
      },
      logger
    );
  }

  function getSubmitLabel(): string {
    if (!hasPendingBroadcastJob && !hasPendingJob) {
      return "CONFIRM WITHDRAWAL";
    }
    return "WITHDRAWING";
  }

  useEffect(() => {
    setIsOnPage(true);
    return () => {
      setIsOnPage(false);
    };
  }, []);

  return (
    <ThemedScrollView>
      <SummaryHeader
        amount={source.amountToWithdraw}
        displaySymbol={source.displaySymbol}
      />
      <ThemedSectionTitle
        testID="title_tx_detail"
        text={translate(
          "screens/ConfirmWithdrawFutureSwapScreen",
          "TRANSACTION DETAILS"
        )}
      />
      <TextRow
        lhs={translate(
          "screens/ConfirmWithdrawFutureSwapScreen",
          "Transaction type"
        )}
        rhs={{
          value: translate(
            "screens/ConfirmWithdrawFutureSwapScreen",
            "Withdraw future swap"
          ),
          testID: "confirm_text_transaction_type",
        }}
        textStyle={tailwind("text-sm font-normal")}
      />
      <WalletAddressRow />
      <NumberRow
        lhs={translate("screens/WithdrawFutureSwapScreen", "Remaining amount")}
        rhs={{
          value: source.remainingAmount.toFixed(8),
          testID: "confirm_text_remaining_amount",
          suffixType: "text",
          suffix: source.displaySymbol,
        }}
        rhsUsdAmount={source.remainingAmountInUSD}
      />
      <InfoRow
        type={InfoType.EstimatedFee}
        value={fee.toFixed(8)}
        testID="confirm_text_fee"
        suffix="DFI"
      />
      <SubmitButtonGroup
        isDisabled={hasPendingJob || hasPendingBroadcastJob || isEnded}
        isCancelDisabled={false}
        label={translate(
          "screens/ConfirmWithdrawFutureSwapScreen",
          "CONFIRM WITHDRAWAL"
        )}
        isProcessing={hasPendingJob || hasPendingBroadcastJob}
        processingLabel={translate(
          "screens/ConfirmWithdrawFutureSwapScreen",
          getSubmitLabel()
        )}
        onCancel={onCancel}
        onSubmit={onSubmit}
        displayCancelBtn
        title="withdraw_future_swap"
      />
    </ThemedScrollView>
  );
}

function SummaryHeader(props: {
  amount: BigNumber;
  displaySymbol: string;
}): JSX.Element {
  return (
    <ThemedView
      dark={tailwind("bg-gray-800 border-b border-gray-700")}
      light={tailwind("bg-white border-b border-gray-300")}
      style={tailwind("flex-col px-4 py-8")}
    >
      <SummaryTitle
        amount={props.amount}
        suffix={props.displaySymbol}
        suffixType="text"
        testID="confirm_text_payment_amount"
        title={translate(
          "screens/ConfirmWithdrawFutureSwapScreen",
          "You are withdrawing"
        )}
      />
    </ThemedView>
  );
}

interface FutureSwapForm {
  source: {
    amountToWithdraw: BigNumber;
    remainingAmount: BigNumber;
    remainingAmountInUSD: BigNumber;
    tokenId: string;
    displaySymbol: string;
    isLoanToken: boolean;
  };
  destination: {
    tokenId: string;
  };
  fee: BigNumber;
}

async function withdrawFutureSwap(
  { source, destination }: FutureSwapForm,
  dispatch: Dispatch<any>,
  onBroadcast: () => void,
  logger: NativeLoggingProps
): Promise<void> {
  try {
    const signer = async (
      account: WhaleWalletAccount
    ): Promise<CTransactionSegWit> => {
      const script = await account.getScript();
      const builder = account.withTransactionBuilder();
      const signed = await builder.account.futureSwap(
        {
          owner: script,
          source: {
            token: Number(source.tokenId),
            amount: source.amountToWithdraw,
          },
          destination: source.isLoanToken ? 0 : Number(destination.tokenId),
          withdraw: true,
        },
        script
      );
      return new CTransactionSegWit(signed);
    };

    dispatch(
      transactionQueue.actions.push({
        sign: signer,
        title: translate("screens/ConfirmWithdrawFutureSwapScreen", "Withdraw"),
        description: translate(
          "screens/ConfirmWithdrawFutureSwapScreen",
          "Withdraw locked amount {{amountToWithdraw}} {{sourceDisplaySymbol}} from future swap",
          {
            amountToWithdraw: source.amountToWithdraw.toFixed(8),
            sourceDisplaySymbol: source.displaySymbol,
          }
        ),
        drawerMessages: {
          preparing: translate(
            "screens/OceanInterface",
            "Preparing withdrawal…"
          ),
          waiting: translate("screens/OceanInterface", "Withdrawing tokens…"),
          complete: translate("screens/OceanInterface", "Withdrawal completed"),
        },
        onBroadcast,
      })
    );
  } catch (e) {
    logger.error(e);
  }
}
