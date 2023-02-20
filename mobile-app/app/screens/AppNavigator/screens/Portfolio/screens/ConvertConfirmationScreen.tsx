import { WalletAlert } from "@components/WalletAlert";
import { ThemedScrollViewV2, ThemedViewV2 } from "@components/themed";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import BigNumber from "bignumber.js";
import { Dispatch, useEffect, useState } from "react";
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
import {
  ConvertTokenUnit,
  getDisplayUnit,
} from "@screens/AppNavigator/screens/Portfolio/screens/ConvertScreen";
import { ScreenName } from "@screens/enum";
import { ConversionMode } from "./ConvertScreen";
import { PortfolioParamList } from "../PortfolioNavigator";

type Props = StackScreenProps<PortfolioParamList, "ConvertConfirmationScreen">;

export function ConvertConfirmationScreen({ route }: Props): JSX.Element {
  const {
    sourceUnit,
    sourceBalance,
    targetUnit,
    targetBalance,
    mode,
    amount,
    fee,
    originScreen,
  } = route.params;
  const { address } = useWalletContext();
  const addressLabel = useAddressLabel(address);
  const hasPendingJob = useSelector((state: RootState) =>
    hasTxQueued(state.transactionQueue)
  );
  const hasPendingBroadcastJob = useSelector((state: RootState) =>
    hasOceanTXQueued(state.ocean)
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

  async function onSubmit(): Promise<void> {
    if (hasPendingJob || hasPendingBroadcastJob) {
      return;
    }
    setIsSubmitting(true);
    await constructSignedConversionAndSend(
      {
        mode,
        amount,
      },
      dispatch,
      () => {
        onTransactionBroadcast(isOnPage, navigation.dispatch);
      },
      logger
    );
    setIsSubmitting(false);
  }

  function onCancel(): void {
    if (!isSubmitting) {
      WalletAlert({
        title: translate("screens/Settings", "Cancel transaction"),
        message: translate(
          "screens/Settings",
          "By cancelling, you will lose any changes you made for your transaction."
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
                  : ScreenName.PORTFOLIO_screen
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
                getDisplayUnit(targetUnit)
              ),
            }
          )}
          amount={amount}
          testID="text_convert_amount"
          iconA="_UTXO"
          fromAddress={address}
          fromAddressLabel={addressLabel}
        />
        <NumberRowV2
          containerStyle={{
            style: tailwind(
              "flex-row items-start w-full bg-transparent border-t-0.5 pt-5 mt-8"
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
            value: translate(
              "screens/ConvertConfirmScreen",
              "Resulting Tokens"
            ),
            testID: "resulting_tokens_label",
            themedProps: {
              light: tailwind("text-mono-light-v2-500"),
              dark: tailwind("text-mono-dark-v2-500"),
            },
          }}
          rhs={{
            value: getResultingValue(
              ConvertTokenUnit.Token,
              fee,
              sourceBalance,
              sourceUnit,
              targetBalance,
              targetUnit
            ),
            suffix: " DFI",
            testID: "resulting_tokens_value",
            themedProps: {
              light: tailwind("text-mono-light-v2-900 font-semibold-v2"),
              dark: tailwind("text-mono-dark-v2-900 font-semibold-v2"),
            },
            subValue: {
              value: getResultingPercentage(
                ConvertTokenUnit.Token,
                sourceBalance,
                sourceUnit,
                targetBalance
              ),
              prefix: "(",
              suffix: "%)",
              testID: "resulting_tokens_sub_value",
            },
          }}
        />

        <NumberRowV2
          containerStyle={{
            style: tailwind(
              "flex-row items-start w-full bg-transparent mt-5 border-b-0.5 pb-5"
            ),
            light: tailwind("bg-transparent border-mono-light-v2-300"),
            dark: tailwind("bg-transparent border-mono-dark-v2-300"),
          }}
          lhs={{
            value: translate("screens/ConvertConfirmScreen", "Resulting UTXO"),
            testID: "resulting_utxo_label",
            themedProps: {
              light: tailwind("text-mono-light-v2-500"),
              dark: tailwind("text-mono-dark-v2-500"),
            },
          }}
          rhs={{
            value: getResultingValue(
              ConvertTokenUnit.UTXO,
              fee,
              sourceBalance,
              sourceUnit,
              targetBalance,
              targetUnit
            ),
            suffix: " DFI",
            testID: "resulting_utxo_value",
            themedProps: {
              light: tailwind("text-mono-light-v2-900 font-semibold-v2"),
              dark: tailwind("text-mono-dark-v2-900 font-semibold-v2"),
            },
            subValue: {
              value: getResultingPercentage(
                ConvertTokenUnit.UTXO,
                sourceBalance,
                sourceUnit,
                targetBalance
              ),
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
  { mode, amount }: { mode: ConversionMode; amount: BigNumber },
  dispatch: Dispatch<any>,
  onBroadcast: () => void,
  logger: NativeLoggingProps
): Promise<void> {
  try {
    dispatch(
      transactionQueue.actions.push(
        dfiConversionCrafter(amount, mode, onBroadcast, () => {})
      )
    );
  } catch (e) {
    logger.error(e);
  }
}

function getResultingValue(
  desireUnit: string,
  fee: BigNumber,
  balanceA: BigNumber,
  unitA: string,
  balanceB: BigNumber,
  unitB: string
): string {
  const balance = desireUnit === unitA ? balanceA : balanceB;
  const unit = desireUnit === unitA ? unitA : unitB;

  return BigNumber.max(
    balance.minus(unit === ConvertTokenUnit.UTXO ? fee : 0),
    0
  ).toFixed(8);
}

function getResultingPercentage(
  desireUnit: string,
  balanceA: BigNumber,
  unitA: string,
  balanceB: BigNumber
): string {
  const amount = desireUnit === unitA ? balanceA : balanceB;
  const totalAmount = balanceA.plus(balanceB);

  return new BigNumber(amount).div(totalAmount).multipliedBy(100).toFixed(2);
}
