import { WalletAlert } from "@components/WalletAlert";
import { ThemedScrollViewV2, ThemedViewV2 } from "@components/themed";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import BigNumber from "bignumber.js";
import { Dispatch, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import {
  hasTxQueued,
  hasOceanTXQueued,
  transactionQueue,
} from "@waveshq/walletkit-ui/dist/store";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import {
  NativeLoggingProps,
  useLogger,
} from "@shared-contexts/NativeLoggingProvider";
import { onTransactionBroadcast } from "@api/transaction/transaction_commands";
import { dfiConversionCrafter } from "@api/transaction/dfi_converter";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { SummaryTitle } from "@components/SummaryTitle";
import { SubmitButtonGroup } from "@components/SubmitButtonGroup";
import { View } from "react-native";
import { useWalletContext } from "@shared-contexts/WalletContext";
import { useAddressLabel } from "@hooks/useAddressLabel";
import { NumberRowV2 } from "@components/NumberRowV2";
import { ConvertDirection, ScreenName } from "@screens/enum";
import {
  TransferDomainToken,
  transferDomainCrafter,
} from "@api/transaction/transfer_domain";
import { useNetworkContext } from "@waveshq/walletkit-ui";
import { NetworkName } from "@defichain/jellyfish-network";
import { providers } from "ethers";
import { useEVMProvider } from "@contexts/EVMProvider";
import { PortfolioParamList } from "../PortfolioNavigator";

type Props = StackScreenProps<PortfolioParamList, "ConvertConfirmationScreen">;

export function ConvertConfirmationScreen({ route }: Props): JSX.Element {
  const {
    amount,
    convertDirection,
    fee,
    sourceToken,
    targetToken,
    originScreen,
  } = route.params;
  const { networkName } = useNetworkContext();
  const { address } = useWalletContext();
  const { provider } = useEVMProvider();
  const addressLabel = useAddressLabel(address);
  const hasPendingJob = useSelector((state: RootState) =>
    hasTxQueued(state.transactionQueue),
  );
  const hasPendingBroadcastJob = useSelector((state: RootState) =>
    hasOceanTXQueued(state.ocean),
  );
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigation = useNavigation<NavigationProp<PortfolioParamList>>();
  const [isOnPage, setIsOnPage] = useState<boolean>(true);
  const logger = useLogger();

  useEffect(() => {
    setIsOnPage(true);
    return () => {
      setIsOnPage(false);
    };
  }, []);

  const [fromLhs, toLhs] = useMemo(() => {
    const dvmText = translate(
      "screens/ConvertConfirmScreen",
      "Resulting Tokens",
    );
    const utxoText = translate(
      "screens/ConvertConfirmScreen",
      "Resulting UTXO",
    );
    const evmText = translate(
      "screens/ConvertConfirmScreen",
      "Resulting Tokens (EVM)",
    );

    switch (convertDirection) {
      case ConvertDirection.accountToUtxos:
        return [dvmText, utxoText];
      case ConvertDirection.utxosToAccount:
        return [utxoText, dvmText];
      case ConvertDirection.dvmToEvm:
        return [dvmText, evmText];
      case ConvertDirection.evmToDvm:
        return [evmText, dvmText];
      default:
        return [evmText, dvmText];
    }
  }, [convertDirection]);

  async function onSubmit(): Promise<void> {
    if (hasPendingJob || hasPendingBroadcastJob) {
      return;
    }
    setIsSubmitting(true);

    if (
      [
        ConvertDirection.accountToUtxos,
        ConvertDirection.utxosToAccount,
      ].includes(convertDirection)
    ) {
      await constructSignedConversionAndSend(
        {
          convertDirection,
          amount,
        },
        dispatch,
        () => {
          onTransactionBroadcast(isOnPage, navigation.dispatch);
        },
        logger,
      );
    } else {
      await constructSignedTransferDomain(
        {
          amount,
          convertDirection,
          sourceToken,
          targetToken,
          networkName,
          provider,
        },
        dispatch,
        () => {
          onTransactionBroadcast(isOnPage, navigation.dispatch);
        },
        logger,
      );
    }

    setIsSubmitting(false);
  }

  function onCancel(): void {
    if (!isSubmitting) {
      WalletAlert({
        title: translate("screens/Settings", "Cancel transaction"),
        message: translate(
          "screens/Settings",
          "By cancelling, you will lose any changes you made for your transaction.",
        ),
        buttons: [
          {
            text: translate("screens/Settings", "Go back"),
            style: "cancel",
          },
          {
            text: translate("screens/Settings", "Cancel"),
            style: "destructive",
            onPress: async () => {
              navigation.navigate(
                originScreen === ScreenName.DEX_screen
                  ? ScreenName.DEX_screen
                  : ScreenName.PORTFOLIO_screen,
              );
            },
          },
        ],
      });
    }
  }

  return (
    <ThemedScrollViewV2 style={tailwind("pb-4")}>
      <ThemedViewV2 style={tailwind("flex-col px-5 py-8")}>
        <SummaryTitle
          title={translate(
            "screens/ConvertConfirmScreen",
            "You are converting to {{unit}}",
            {
              unit: translate(
                "screens/ConvertScreen",
                `${targetToken.displayTextSymbol}${
                  convertDirection === ConvertDirection.dvmToEvm ? "-EVM" : ""
                }`,
              ),
            },
          )}
          amount={amount}
          testID="text_convert_amount"
          iconA={targetToken.displaySymbol}
          fromAddress={address}
          fromAddressLabel={addressLabel}
          isEvmToken={convertDirection === ConvertDirection.dvmToEvm}
        />
        <NumberRowV2
          containerStyle={{
            style: tailwind(
              "flex-row items-start w-full bg-transparent border-t-0.5 pt-5 mt-8",
            ),
            light: tailwind("bg-transparent border-mono-light-v2-300"),
            dark: tailwind("bg-transparent border-mono-dark-v2-300"),
          }}
          lhs={{
            value: translate("screens/ConvertConfirmScreen", "Transaction fee"),
            testID: "transaction_fee_label",
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

        <NumberRowV2
          containerStyle={{
            style: tailwind("flex-row items-start w-full bg-transparent mt-5"),
            light: tailwind("bg-transparent"),
            dark: tailwind("bg-transparent"),
          }}
          lhs={{
            value: fromLhs,
            testID: "resulting_tokens_label",
            themedProps: {
              light: tailwind("text-mono-light-v2-500"),
              dark: tailwind("text-mono-dark-v2-500"),
            },
          }}
          rhs={{
            value: getResultingValue({
              balance: sourceToken.balance,
              convertDirection,
              fee,
            }),
            suffix: ` ${sourceToken.displayTextSymbol}${
              convertDirection !== ConvertDirection.evmToDvm ? "" : "-EVM"
            }`,
            testID: "resulting_tokens_value",
            themedProps: {
              light: tailwind("text-mono-light-v2-900 font-semibold-v2"),
              dark: tailwind("text-mono-dark-v2-900 font-semibold-v2"),
            },
            subValue: {
              value: getResultingPercentage({
                balanceA: targetToken.balance,
                balanceB: sourceToken.balance,
              }),
              prefix: "(",
              suffix: "%)",
              testID: "resulting_tokens_sub_value",
            },
          }}
        />

        <NumberRowV2
          containerStyle={{
            style: tailwind(
              "flex-row items-start w-full bg-transparent mt-5 border-b-0.5 pb-5",
            ),
            light: tailwind("bg-transparent border-mono-light-v2-300"),
            dark: tailwind("bg-transparent border-mono-dark-v2-300"),
          }}
          lhs={{
            value: translate("screens/ConvertConfirmScreen", toLhs),
            testID: "resulting_utxo_label",
            themedProps: {
              light: tailwind("text-mono-light-v2-500"),
              dark: tailwind("text-mono-dark-v2-500"),
            },
          }}
          rhs={{
            value: getResultingValue({
              balance: targetToken.balance,
              convertDirection,
              fee,
            }),
            suffix: ` ${targetToken.displayTextSymbol}${
              convertDirection === ConvertDirection.dvmToEvm ? "-EVM" : ""
            }`,
            testID: "resulting_utxo_value",
            themedProps: {
              light: tailwind("text-mono-light-v2-900 font-semibold-v2"),
              dark: tailwind("text-mono-dark-v2-900 font-semibold-v2"),
            },
            subValue: {
              value: getResultingPercentage({
                balanceA: sourceToken.balance,
                balanceB: targetToken.balance,
              }),
              prefix: "(",
              suffix: "%)",
              testID: "resulting_utxo_sub_value",
            },
          }}
        />

        <View style={tailwind("mt-20")}>
          <SubmitButtonGroup
            isDisabled={false}
            title="convert"
            label={translate("screens/ConvertConfirmScreen", "Convert")}
            displayCancelBtn
            onSubmit={onSubmit}
            onCancel={onCancel}
          />
        </View>
      </ThemedViewV2>
    </ThemedScrollViewV2>
  );
}

async function constructSignedConversionAndSend(
  {
    convertDirection,
    amount,
  }: { convertDirection: ConvertDirection; amount: BigNumber },
  dispatch: Dispatch<any>,
  onBroadcast: () => void,
  logger: NativeLoggingProps,
): Promise<void> {
  try {
    dispatch(
      transactionQueue.actions.push(
        dfiConversionCrafter(amount, convertDirection, onBroadcast, () => {}),
      ),
    );
  } catch (e) {
    logger.error(e);
  }
}

async function constructSignedTransferDomain(
  {
    amount,
    convertDirection,
    sourceToken,
    targetToken,
    networkName,
    provider,
  }: {
    convertDirection: ConvertDirection;
    sourceToken: TransferDomainToken;
    targetToken: TransferDomainToken;
    amount: BigNumber;
    networkName: NetworkName;
    provider: providers.JsonRpcProvider;
  },
  dispatch: Dispatch<any>,
  onBroadcast: () => void,
  logger: NativeLoggingProps,
): Promise<void> {
  try {
    dispatch(
      transactionQueue.actions.push(
        transferDomainCrafter(
          amount,
          convertDirection,
          sourceToken,
          targetToken,
          networkName,
          onBroadcast,
          () => {},
          provider,
        ),
      ),
    );
  } catch (e) {
    logger.error(e);
  }
}

function getResultingValue({
  balance,
  convertDirection,
  fee,
}: {
  balance: BigNumber;
  convertDirection: ConvertDirection;
  fee: BigNumber;
}): string {
  return BigNumber.max(
    balance.minus(
      convertDirection === ConvertDirection.accountToUtxos ? fee : 0,
    ),
    0,
  ).toFixed(8);
}

function getResultingPercentage({
  balanceA,
  balanceB,
}: {
  balanceA: BigNumber;
  balanceB: BigNumber;
}): string {
  const totalAmount = balanceA.plus(balanceB);

  return new BigNumber(balanceB).div(totalAmount).multipliedBy(100).toFixed(2);
}
