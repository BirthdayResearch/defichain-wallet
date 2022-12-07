import { ThemedScrollViewV2, ThemedViewV2 } from "@components/themed";
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
import { onTransactionBroadcast } from "@api/transaction/transaction_commands";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { SummaryTitle } from "@components/SummaryTitle";
import { useWalletContext } from "@shared-contexts/WalletContext";
import { useAddressLabel } from "@hooks/useAddressLabel";
import { AddressType } from "@store/wallet";
import { NumberRowV2 } from "@components/NumberRowV2";
import { useTokenPrice } from "@screens/AppNavigator/screens/Portfolio/hooks/TokenPrice";
import { View } from "react-native";
import { SubmitButtonGroup } from "@components/SubmitButtonGroup";
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
  const { tailwind } = useStyles();
  const { address } = useWalletContext();
  const addressLabel = useAddressLabel(address);
  const { getTokenPrice } = useTokenPrice();
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

  const themedProps = {
    light: tailwind("text-mono-light-v2-500"),
    dark: tailwind("text-mono-dark-v2-500"),
  };

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

  useEffect(() => {
    setIsOnPage(true);
    return () => {
      setIsOnPage(false);
    };
  }, []);

  return (
    <ThemedScrollViewV2
      style={tailwind("pt-8 px-5")}
      contentContainerStyle={tailwind("flex-grow justify-between pb-4")}
    >
      <View>
        <SummaryTitle
          title={translate(
            "screens/ConfirmWithdrawFutureSwapScreen",
            "You are withdrawing"
          )}
          amount={source.amountToWithdraw}
          testID="title_tx_detail"
          iconA={source.displaySymbol}
          toAddress={address}
          toAddressLabel={addressLabel}
          addressType={AddressType.WalletAddress}
        />

        <ThemedViewV2
          style={tailwind("mt-8 border-t-0.5 border-b-0.5 pt-5")}
          light={tailwind("border-mono-light-v2-300")}
          dark={tailwind("border-mono-dark-v2-300")}
        >
          <NumberRowV2
            lhs={{
              value: translate(
                "screens/ConfirmWithdrawFutureSwapScreen",
                "Transaction fee"
              ),
              themedProps: themedProps,
              testID: "transaction_fee_label",
            }}
            rhs={{
              value: fee.toFixed(8),
              testID: "text_fee",
              suffix: " DFI",
            }}
          />

          <NumberRowV2
            containerStyle={{
              style: tailwind(
                "flex-row items-start w-full bg-transparent pt-5"
              ),
            }}
            lhs={{
              value: translate(
                "screens/ConfirmWithdrawFutureSwapScreen",
                "To receive (est.)"
              ),
              themedProps: themedProps,
              testID: "receive_label",
            }}
            rhs={{
              value: source.amountToWithdraw.toFixed(8),
              testID: "receive_value",
              suffix: ` ${source.displaySymbol}`,
              textStyle: tailwind("font-semibold-v2"),
              usdAmount: getTokenPrice(source.symbol, source.amountToWithdraw),
              usdTextStyle: tailwind("text-sm"),
              usdContainerStyle: tailwind("pt-1"),
            }}
          />
        </ThemedViewV2>
      </View>

      <View style={tailwind("pt-12 mx-3")}>
        <SubmitButtonGroup
          isDisabled={hasPendingJob || hasPendingBroadcastJob || isEnded}
          title="withdraw_future_swap"
          label={translate(
            "screens/ConfirmWithdrawFutureSwapScreen",
            "Withdraw"
          )}
          displayCancelBtn
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </View>
    </ThemedScrollViewV2>
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
    displaySymbol: string;
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

    const amountToWithdraw = source.amountToWithdraw.toFixed(8);
    const sourceSymbol = source.displaySymbol;
    dispatch(
      transactionQueue.actions.push({
        sign: signer,
        title: translate(
          "screens/ConfirmWithdrawFutureSwapScreen",
          "Withdrawing {{amountToWithdraw}} {{sourceSymbol}} from {{sourceSymbol}}-{{destinationSymbol}} swap",
          {
            amountToWithdraw: amountToWithdraw,
            sourceSymbol: sourceSymbol,
            destinationSymbol: destination.displaySymbol,
          }
        ),
        drawerMessages: {
          preparing: translate(
            "screens/OceanInterface",
            "Preparing withdrawal…"
          ),
          waiting: translate(
            "screens/OceanInterface",
            "Withdrawing {{amountToWithdraw}} {{sourceSymbol}} from future swap…",
            {
              amountToWithdraw: amountToWithdraw,
              sourceSymbol: sourceSymbol,
            }
          ),
          complete: translate("screens/OceanInterface", "Withdrawal completed"),
        },
        onBroadcast,
      })
    );
  } catch (e) {
    logger.error(e);
  }
}
