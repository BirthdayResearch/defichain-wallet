import { WalletAlert } from "@components/WalletAlert";
import { Dispatch, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getColor, tailwind } from "@tailwind";
import { StackScreenProps } from "@react-navigation/stack";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import BigNumber from "bignumber.js";
import { RootState } from "@store";
import { hasTxQueued as hasBroadcastQueued } from "@store/ocean";
import { translate } from "@translations";
import { hasTxQueued, transactionQueue } from "@store/transaction_queue";
import {
  CompositeSwap,
  CTransactionSegWit,
  SetFutureSwap,
} from "@defichain/jellyfish-transaction";
import { PoolPairData } from "@defichain/whale-api-client/dist/api/poolpairs";
import { WhaleWalletAccount } from "@defichain/whale-api-wallet";
import { onTransactionBroadcast } from "@api/transaction/transaction_commands";
import {
  NativeLoggingProps,
  useLogger,
} from "@shared-contexts/NativeLoggingProvider";
import {
  ThemedActivityIndicatorV2,
  ThemedIcon,
  ThemedScrollViewV2,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2,
} from "@components/themed";
import { View } from "@components";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { useTokenPrice } from "@screens/AppNavigator/screens/Portfolio/hooks/TokenPrice";
import { useWalletContext } from "@shared-contexts/WalletContext";
import { useAddressLabel } from "@hooks/useAddressLabel";
import { ConfirmSummaryTitle } from "@components/ConfirmSummaryTitle";
import { NumberRowV2 } from "@components/NumberRowV2";
import { SubmitButtonGroupV2 } from "@components/SubmitButtonGroupV2";
import { TextRowV2 } from "@components/TextRowV2";
import { PricesSectionV2 } from "@components/PricesSectionV2";
import Checkbox from "expo-checkbox";
import { DexParamList, DexScreenOrigin } from "../DexNavigator";
import { OwnedTokenState, TokenState } from "./CompositeSwapScreen";
import { useDexStabilization } from "../hook/DexStabilization";

type Props = StackScreenProps<DexParamList, "ConfirmCompositeSwapScreen">;

export interface CompositeSwapForm {
  tokenFrom: OwnedTokenState;
  tokenTo: TokenState & { amount?: string };
  amountFrom: BigNumber;
  amountTo: BigNumber;
}

export function ConfirmCompositeSwapScreen({ route }: Props): JSX.Element {
  const {
    conversion,
    fee,
    pairs,
    priceRates,
    slippage,
    tokenA,
    tokenB,
    swap,
    futureSwap,
    estimatedAmount,
    totalFees,
    estimatedLessFeesAfterSlippage,
    originScreen,
  } = route.params;
  const navigation = useNavigation<NavigationProp<DexParamList>>();
  const dispatch = useAppDispatch();
  const logger = useLogger();
  const { getTokenPrice } = useTokenPrice();
  const hasPendingJob = useSelector((state: RootState) =>
    hasTxQueued(state.transactionQueue)
  );
  const hasPendingBroadcastJob = useSelector((state: RootState) =>
    hasBroadcastQueued(state.ocean)
  );
  const blockCount = useSelector((state: RootState) => state.block.count ?? 0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOnPage, setIsOnPage] = useState(true);
  const isFutureSwap = futureSwap !== undefined;

  const { address } = useWalletContext();
  const addressLabel = useAddressLabel(address);

  const [isAcknowledge, setIsAcknowledge] = useState(false);

  const {
    dexStabilization: { dexStabilizationType },
  } = useDexStabilization(tokenA, tokenB);

  const dexStabMessage =
    dexStabilizationType !== "none"
      ? "Are you sure you want to proceed with your transaction even with the high DEX stabilization fee?"
      : undefined;

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
    if (futureSwap !== undefined) {
      const futureSwapForm: FutureSwapForm = {
        fromTokenId: Number(swap.tokenFrom.id),
        toTokenId: Number(swap.tokenTo.id),
        amount: new BigNumber(swap.amountFrom),
        isSourceLoanToken: futureSwap.isSourceLoanToken,
        fromTokenDisplaySymbol: swap.tokenFrom.displaySymbol,
        toTokenDisplaySymbol: swap.tokenTo.displaySymbol,
        oraclePriceText: futureSwap.oraclePriceText,
        executionBlock: futureSwap.executionBlock,
      };
      await constructSignedFutureSwapAndSend(
        futureSwapForm,
        dispatch,
        () => {
          onTransactionBroadcast(isOnPage, navigation.dispatch);
        },
        logger
      );
    } else {
      await constructSignedSwapAndSend(
        swap,
        pairs,
        slippage,
        dispatch,
        () => {
          onTransactionBroadcast(isOnPage, navigation.dispatch);
        },
        logger
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
                originScreen === DexScreenOrigin.Dex_screen
                  ? "DexScreen"
                  : "PortfolioScreen"
              );
            },
          },
        ],
      });
    }
  }

  return (
    <ThemedScrollViewV2 style={tailwind("py-8 px-5")}>
      <ThemedViewV2 style={tailwind("flex-col pb-4 mb-4")}>
        <ConfirmSummaryTitle
          title={translate(
            "screens/ConfirmCompositeSwapScreen",
            "You are swapping"
          )}
          fromTokenAmount={swap.amountFrom}
          toTokenAmount={estimatedAmount}
          testID="text_swap_amount"
          iconA={tokenA.displaySymbol}
          iconB={tokenB.displaySymbol}
          fromAddress={address}
          fromAddressLabel={addressLabel}
          isFutureSwap={futureSwap !== undefined}
          oraclePrice={futureSwap?.oraclePriceText}
        />
      </ThemedViewV2>

      {conversion?.isConversionRequired === true && (
        <ThemedViewV2
          dark={tailwind("border-gray-700")}
          light={tailwind("border-gray-300")}
          style={tailwind("py-5 border-t-0.5")}
        >
          <NumberRowV2
            lhs={{
              value: translate("screens/ConfirmAddLiq", "Amount to convert"),
              testID: "amount_to_convert",
              themedProps: {
                light: tailwind("text-mono-light-v2-500"),
                dark: tailwind("text-mono-dark-v2-500"),
              },
            }}
            rhs={{
              value: conversion.conversionAmount.toFixed(8),
              testID: "amount_to_convert_value",
            }}
          />
          <View
            style={tailwind(
              "flex flex-row text-right items-center justify-end"
            )}
          >
            <ThemedTextV2
              style={tailwind("mr-1.5 font-normal-v2 text-sm")}
              light={tailwind("text-mono-light-v2-700")}
              dark={tailwind("text-mono-dark-v2-700")}
              testID="conversion_status"
            >
              {translate(
                "screens/ConvertConfirmScreen",
                conversion?.isConversionRequired &&
                  conversion?.isConverted !== true
                  ? "Converting"
                  : "Converted"
              )}
            </ThemedTextV2>
            {conversion?.isConversionRequired &&
              conversion?.isConverted !== true && <ThemedActivityIndicatorV2 />}
            {conversion?.isConversionRequired &&
              conversion?.isConverted === true && (
                <ThemedIcon
                  light={tailwind("text-success-600")}
                  dark={tailwind("text-darksuccess-500")}
                  iconType="MaterialIcons"
                  name="check-circle"
                  size={20}
                />
              )}
          </View>
        </ThemedViewV2>
      )}

      {!isFutureSwap && (
        <ThemedViewV2
          dark={tailwind("border-gray-700")}
          light={tailwind("border-gray-300")}
          style={tailwind("py-5 border-t-0.5")}
        >
          <PricesSectionV2
            priceRates={priceRates}
            testID="instant_swap_summary"
          />
          <NumberRowV2
            lhs={{
              value: translate(
                "screens/ConfirmCompositeSwapScreen",
                "Slippage tolerance"
              ),
              testID: "confirm_slippage_fee_label",
              themedProps: {
                light: tailwind("text-mono-light-v2-500"),
                dark: tailwind("text-mono-dark-v2-500"),
              },
            }}
            rhs={{
              value: new BigNumber(slippage).times(100).toFixed(),
              testID: "confirm_slippage_fee",
              suffix: "%",
            }}
          />
        </ThemedViewV2>
      )}

      {!isFutureSwap && (
        <ThemedViewV2
          dark={tailwind("border-gray-700")}
          light={tailwind("border-gray-300")}
          style={tailwind("py-5 border-t-0.5")}
        >
          <NumberRowV2
            lhs={{
              value: translate(
                "screens/ConfirmCompositeSwapScreen",
                "Total fees"
              ),
              testID: "transaction_fee",
              themedProps: {
                light: tailwind("text-mono-light-v2-500"),
                dark: tailwind("text-mono-dark-v2-500"),
              },
            }}
            rhs={{
              value: totalFees,
              testID: "transaction_fee_amount",
              prefix: "$",
            }}
          />
        </ThemedViewV2>
      )}

      <ThemedViewV2
        dark={tailwind("border-gray-700")}
        light={tailwind("border-gray-300")}
        style={tailwind("border-t-0.5")}
      >
        {futureSwap !== undefined ? (
          <>
            <ThemedViewV2
              dark={tailwind("border-gray-700")}
              light={tailwind("border-gray-300")}
              style={tailwind("py-5 border-b-0.5")}
            >
              <NumberRowV2
                lhs={{
                  value: translate(
                    "screens/ConfirmCompositeSwapScreen",
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
                  testID: "confirm_text_fee",
                  suffix: " DFI",
                }}
              />
            </ThemedViewV2>
            <View style={tailwind("pt-5")}>
              <NumberRowV2
                lhs={{
                  value: translate(
                    "screens/ConfirmCompositeSwapScreen",
                    "Settlement block"
                  ),
                  testID: "settlement_block",
                  themedProps: {
                    light: tailwind("text-mono-light-v2-500"),
                    dark: tailwind("text-mono-dark-v2-500"),
                  },
                }}
                rhs={{
                  value: futureSwap.executionBlock,
                  testID: "confirm_text_settlement_block",
                }}
              />
              <TextRowV2
                lhs={{
                  value: "",
                  testID: "",
                }}
                rhs={{
                  value: futureSwap.transactionDate,
                  testID: "confirm_text_transaction_date",
                }}
              />
            </View>
            <ThemedViewV2
              dark={tailwind("border-gray-700")}
              light={tailwind("border-gray-300")}
              style={tailwind("py-5 border-b-0.5")}
            >
              <TextRowV2
                lhs={{
                  value: translate(
                    "screens/ConfirmCompositeSwapScreen",
                    "Estimated to receive"
                  ),
                  testID: "confirm_text_receive",
                  themedProps: {
                    light: tailwind("text-mono-light-v2-500"),
                    dark: tailwind("text-mono-dark-v2-500"),
                  },
                }}
                rhs={{
                  value: `${tokenB.displaySymbol}`,
                  testID: "confirm_text_receive_unit",
                  themedProps: {
                    light: tailwind("text-mono-light-v2-900"),
                    dark: tailwind("text-mono-dark-v2-900"),
                  },
                }}
              />
              <TextRowV2
                lhs={{
                  value: "",
                  testID: "",
                }}
                rhs={{
                  value: translate(
                    "screens/ConfirmCompositeSwapScreen",
                    "Settlement value {{percentageChange}}",
                    {
                      percentageChange: futureSwap.oraclePriceText,
                    }
                  ),
                  testID: "confirm_settlement_value",
                }}
              />
            </ThemedViewV2>
          </>
        ) : (
          <ThemedViewV2
            dark={tailwind("border-gray-700")}
            light={tailwind("border-gray-300")}
            style={tailwind("py-5 border-b-0.5")}
          >
            <NumberRowV2
              lhs={{
                value: translate(
                  "screens/ConfirmCompositeSwapScreen",
                  "Estimated to receive (incl. all fees)"
                ),
                testID: "estimated_to_receive",
                themedProps: {
                  light: tailwind("text-mono-light-v2-500"),
                  dark: tailwind("text-mono-dark-v2-500"),
                },
              }}
              rhs={{
                testID: "confirm_estimated_to_receive",
                value: new BigNumber(estimatedLessFeesAfterSlippage).toFixed(8),
                suffix: ` ${swap.tokenTo.displaySymbol}`,
                usdAmount: getTokenPrice(
                  tokenB.symbol,
                  new BigNumber(estimatedLessFeesAfterSlippage),
                  false
                ),
                themedProps: {
                  style: tailwind("font-semibold-v2 text-right"),
                },
              }}
            />
          </ThemedViewV2>
        )}
      </ThemedViewV2>

      <View style={tailwind("pt-10 pb-14 px-3")}>
        {dexStabMessage && (
          <DexStabAcknowledgeCheckBox
            isAcknowledge={isAcknowledge}
            onSwitch={(val) => setIsAcknowledge(val)}
            message={dexStabMessage}
          />
        )}
        <SubmitButtonGroupV2
          isDisabled={
            (!isAcknowledge && dexStabilizationType !== "none") ||
            isSubmitting ||
            hasPendingJob ||
            hasPendingBroadcastJob ||
            (futureSwap !== undefined &&
              blockCount >= futureSwap.executionBlock)
          }
          label={translate("screens/ConfirmCompositeSwapScreen", "Swap")}
          onSubmit={onSubmit}
          onCancel={onCancel}
          displayCancelBtn
          title="swap"
        />
      </View>
    </ThemedScrollViewV2>
  );
}

function DexStabAcknowledgeCheckBox(props: {
  isAcknowledge: boolean;
  onSwitch: (val: boolean) => void;
  message: string;
}): JSX.Element {
  return (
    <View style={tailwind("px-7 flex flex-row justify-center")}>
      <Checkbox
        value={props.isAcknowledge}
        style={tailwind("h-6 w-6 mt-1 rounded")}
        onValueChange={props.onSwitch}
        color={props.isAcknowledge ? getColor("brand-v2-500") : undefined}
        testID="lp_ack_checkbox"
      />
      <ThemedTouchableOpacityV2
        style={tailwind("flex-1")}
        activeOpacity={0.7}
        onPress={() => {
          props.onSwitch(!props.isAcknowledge);
        }}
      >
        <ThemedTextV2
          style={tailwind("ml-4 flex-1 text-xs font-normal-v2")}
          light={tailwind("text-mono-light-v2-700")}
          dark={tailwind("text-mono-dark-v2-700")}
        >
          {translate("screens/ConfirmCompositeSwapScreen", props.message)}
        </ThemedTextV2>
      </ThemedTouchableOpacityV2>
    </View>
  );
}

async function constructSignedSwapAndSend(
  cSwapForm: CompositeSwapForm,
  pairs: PoolPairData[],
  slippage: BigNumber,
  dispatch: Dispatch<any>,
  onBroadcast: () => void,
  logger: NativeLoggingProps
): Promise<void> {
  try {
    const maxPrice = cSwapForm.amountFrom
      .div(cSwapForm.amountTo)
      .times(slippage.plus(1))
      .decimalPlaces(8);
    const signer = async (
      account: WhaleWalletAccount
    ): Promise<CTransactionSegWit> => {
      const builder = account.withTransactionBuilder();
      const script = await account.getScript();
      const swap: CompositeSwap = {
        poolSwap: {
          fromScript: script,
          toScript: script,
          fromTokenId: Number(
            cSwapForm.tokenFrom.id === "0_unified"
              ? "0"
              : cSwapForm.tokenFrom.id
          ),
          toTokenId: Number(
            cSwapForm.tokenTo.id === "0_unified" ? "0" : cSwapForm.tokenTo.id
          ),
          fromAmount: cSwapForm.amountFrom,
          maxPrice,
        },
        pools: pairs.map((pair) => ({ id: Number(pair.id) })),
      };
      const dfTx = await builder.dex.compositeSwap(swap, script);

      return new CTransactionSegWit(dfTx);
    };

    dispatch(
      transactionQueue.actions.push({
        sign: signer,
        title: translate(
          "screens/OceanInterface",
          "Swapping {{amountA}} {{symbolA}} to {{amountB}} {{symbolB}}",
          {
            amountA: cSwapForm.amountFrom.toFixed(8),
            amountB: cSwapForm.amountTo.toFixed(8),
            symbolA: cSwapForm.tokenFrom.displaySymbol,
            symbolB: cSwapForm.tokenTo.displaySymbol,
          }
        ),
        drawerMessages: {
          waiting: translate(
            "screens/OceanInterface",
            "Swapping {{amountA}} {{symbolA}} to {{amountB}} {{symbolB}}",
            {
              amountA: cSwapForm.amountFrom.toFixed(8),
              amountB: cSwapForm.amountTo.toFixed(8),
              symbolA: cSwapForm.tokenFrom.displaySymbol,
              symbolB: cSwapForm.tokenTo.displaySymbol,
            }
          ),
          complete: translate(
            "screens/OceanInterface",
            "Swapped {{amountA}} {{symbolA}} to {{amountB}} {{symbolB}}",
            {
              amountA: cSwapForm.amountFrom.toFixed(8),
              amountB: cSwapForm.amountTo.toFixed(8),
              symbolA: cSwapForm.tokenFrom.displaySymbol,
              symbolB: cSwapForm.tokenTo.displaySymbol,
            }
          ),
        },
        onBroadcast,
      })
    );
  } catch (e) {
    logger.error(e);
  }
}

interface FutureSwapForm {
  fromTokenId: number;
  amount: BigNumber;
  toTokenId: number;
  isSourceLoanToken: boolean;
  fromTokenDisplaySymbol: string;
  toTokenDisplaySymbol: string;
  oraclePriceText: string;
  executionBlock: number;
}

async function constructSignedFutureSwapAndSend(
  futureSwap: FutureSwapForm,
  dispatch: Dispatch<any>,
  onBroadcast: () => void,
  logger: NativeLoggingProps
): Promise<void> {
  try {
    const signer = async (
      account: WhaleWalletAccount
    ): Promise<CTransactionSegWit> => {
      const builder = account.withTransactionBuilder();
      const script = await account.getScript();
      const swap: SetFutureSwap = {
        owner: script,
        source: {
          token: futureSwap.fromTokenId,
          amount: futureSwap.amount,
        },
        destination: futureSwap.isSourceLoanToken ? 0 : futureSwap.toTokenId,
        withdraw: false,
      };
      const dfTx = await builder.account.futureSwap(swap, script);

      return new CTransactionSegWit(dfTx);
    };

    dispatch(
      transactionQueue.actions.push({
        sign: signer,
        title: translate(
          "screens/OceanInterface",
          "Swapping {{amountA}} {{fromTokenDisplaySymbol}} to {{toTokenDisplaySymbol}} on settlement block {{settlementBlock}}",
          {
            amountA: futureSwap.amount.toFixed(8),
            fromTokenDisplaySymbol: futureSwap.fromTokenDisplaySymbol,
            toTokenDisplaySymbol: futureSwap.toTokenDisplaySymbol,
            settlementBlock: futureSwap.executionBlock,
          }
        ),
        drawerMessages: {
          preparing: translate(
            "screens/OceanInterface",
            "Preparing your transaction…"
          ),
          waiting: translate(
            "screens/OceanInterface",
            "Processing future swap…"
          ),
          complete: translate(
            "screens/OceanInterface",
            "Future Swap confirmed for next settlement block"
          ),
        },
        onBroadcast,
      })
    );
  } catch (e) {
    logger.error(e);
  }
}
