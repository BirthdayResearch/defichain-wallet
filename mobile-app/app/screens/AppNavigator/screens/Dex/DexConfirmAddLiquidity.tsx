import { WalletAlert } from "@components/WalletAlert";
import { CTransactionSegWit } from "@defichain/jellyfish-transaction";
import { WhaleWalletAccount } from "@defichain/whale-api-wallet";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import { View } from "react-native";
import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Dispatch } from "redux";
import {
  ThemedActivityIndicatorV2,
  ThemedIcon,
  ThemedScrollViewV2,
  ThemedTextV2,
  ThemedViewV2,
} from "@components/themed";
import { RootState } from "@store";
import { hasTxQueued as hasBroadcastQueued } from "@store/ocean";
import { hasTxQueued, transactionQueue } from "@store/transaction_queue";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { onTransactionBroadcast } from "@api/transaction/transaction_commands";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { SummaryTitleV2 } from "@components/SummaryTitleV2";
import { useWalletContext } from "@shared-contexts/WalletContext";
import { useAddressLabel } from "@hooks/useAddressLabel";
import {
  NativeLoggingProps,
  useLogger,
} from "@shared-contexts/NativeLoggingProvider";
import { NumberRowV2 } from "@components/NumberRowV2";
import { SubmitButtonGroup } from "@components/SubmitButtonGroup";
import { ScreenName } from "@screens/enum";
import { useTokenPrice } from "../Portfolio/hooks/TokenPrice";
import { DexParamList } from "./DexNavigator";

type Props = StackScreenProps<DexParamList, "ConfirmAddLiquidity">;

export function ConfirmAddLiquidityScreen({ route }: Props): JSX.Element {
  const hasPendingJob = useSelector((state: RootState) =>
    hasTxQueued(state.transactionQueue)
  );
  const hasPendingBroadcastJob = useSelector((state: RootState) =>
    hasBroadcastQueued(state.ocean)
  );
  const {
    pair,
    conversion,
    originScreen,
    summary: { fee, percentage, tokenAAmount, tokenBAmount, lmTotalTokens },
  } = route.params;
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lmTokenAmount = percentage.times(pair.totalLiquidity.token);
  const [isOnPage, setIsOnPage] = useState<boolean>(true);
  const navigation = useNavigation<NavigationProp<DexParamList>>();
  const logger = useLogger();
  const { address } = useWalletContext();
  const addressLabel = useAddressLabel(address);
  const { getTokenPrice } = useTokenPrice();

  useEffect(() => {
    setIsOnPage(true);
    return () => {
      setIsOnPage(false);
    };
  }, []);

  async function addLiquidity(): Promise<void> {
    if (hasPendingJob || hasPendingBroadcastJob) {
      return;
    }
    setIsSubmitting(true);
    await constructSignedAddLiqAndSend(
      {
        tokenASymbol: pair.tokenA.displaySymbol,
        tokenAId: Number(pair.tokenA.id),
        tokenAAmount,
        tokenBSymbol: pair.tokenB.displaySymbol,
        tokenBId: Number(pair.tokenB.id),
        tokenBAmount,
        lmTotalTokens: lmTotalTokens,
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
    <ThemedScrollViewV2 style={tailwind("py-8 px-5")}>
      <ThemedViewV2 style={tailwind("flex-col pb-4 mb-4")}>
        <SummaryTitleV2
          iconA={pair.tokenA.displaySymbol}
          iconB={pair.tokenB.displaySymbol}
          fromAddress={address}
          amount={lmTokenAmount}
          testID="text_add_amount"
          title={translate(
            "screens/ConfirmAddLiq",
            "You will receive LP tokens"
          )}
          fromAddressLabel={addressLabel}
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
              testID: "transaction_fee",
              themedProps: {
                light: tailwind("text-mono-light-v2-500"),
                dark: tailwind("text-mono-dark-v2-500"),
              },
            }}
            rhs={{
              value: lmTokenAmount.toFixed(8),
              testID: `${pair.tokenA.displaySymbol}_to_supply`,
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

      <ThemedViewV2
        dark={tailwind("border-gray-700")}
        light={tailwind("border-gray-300")}
        style={tailwind("py-5 border-t-0.5")}
      >
        <View style={tailwind("mb-6")}>
          <NumberRowV2
            lhs={{
              value: translate("screens/ConfirmAddLiq", "Transaction fee"),
              testID: "transaction_fee",
              themedProps: {
                light: tailwind("text-mono-light-v2-500"),
                dark: tailwind("text-mono-dark-v2-500"),
              },
            }}
            rhs={{
              value: `${fee.toFixed(8)}`,
              testID: "transaction_fee_amount",
              suffix: " DFI",
            }}
          />
        </View>
        <NumberRowV2
          lhs={{
            value: translate("screens/ConfirmAddLiq", "Pool share"),
            testID: "pool_share",
            themedProps: {
              light: tailwind("text-mono-light-v2-500"),
              dark: tailwind("text-mono-dark-v2-500"),
            },
          }}
          rhs={{
            value: percentage.times(100).toFixed(8),
            testID: "pool_share_amount",
            suffix: "%",
          }}
        />
      </ThemedViewV2>
      <ThemedViewV2
        dark={tailwind("border-gray-700")}
        light={tailwind("border-gray-300")}
        style={tailwind("py-5 border-t-0.5 border-b-0.5 ")}
      >
        <NumberRowV2
          lhs={{
            value: translate("screens/ConfirmAddLiq", "{{token}} to supply", {
              token: pair.tokenA.displaySymbol,
            }),
            testID: `${pair.tokenA.displaySymbol}_token_to_supply`,
            themedProps: {
              light: tailwind("text-mono-light-v2-500"),
              dark: tailwind("text-mono-dark-v2-500"),
            },
          }}
          rhs={{
            value: BigNumber.max(tokenAAmount, 0).toFixed(8),
            testID: `${pair.tokenA.displaySymbol}_to_supply`,
            usdAmount: getTokenPrice(pair.tokenA.symbol, tokenAAmount),
            usdTextStyle: tailwind("text-sm"),
          }}
        />
        <NumberRowV2
          lhs={{
            value: translate("screens/ConfirmAddLiq", "{{token}} to supply", {
              token: pair.tokenB.displaySymbol,
            }),
            testID: `${pair.tokenB.displaySymbol}_token_to_supply`,
            themedProps: {
              light: tailwind("text-mono-light-v2-500"),
              dark: tailwind("text-mono-dark-v2-500"),
            },
          }}
          rhs={{
            value: BigNumber.max(tokenBAmount, 0).toFixed(8),
            testID: `${pair.tokenB.displaySymbol}_to_supply`,
            usdAmount: getTokenPrice(pair.tokenB.symbol, tokenBAmount),
            usdTextStyle: tailwind("text-sm"),
          }}
        />
        <NumberRowV2
          lhs={{
            value: translate("screens/ConfirmAddLiq", "LP Tokens to receive"),
            testID: "resulting_LP_tokens",
            themedProps: {
              light: tailwind("text-mono-light-v2-500"),
              dark: tailwind("text-mono-dark-v2-500"),
            },
          }}
          rhs={{
            value: BigNumber.max(lmTokenAmount, 0).toFixed(8),
            testID: "lp_tokens_to_receive_value",
            usdAmount: getTokenPrice(
              pair.tokenA.symbol,
              new BigNumber(tokenAAmount)
            ).plus(
              getTokenPrice(pair.tokenB.symbol, new BigNumber(tokenBAmount))
            ),
            themedProps: {
              style: tailwind("font-semibold-v2 text-sm"),
            },
            usdTextStyle: tailwind("text-sm"),
          }}
        />
      </ThemedViewV2>

      <View style={tailwind("py-14 px-3")}>
        <SubmitButtonGroup
          isDisabled={isSubmitting || hasPendingJob || hasPendingBroadcastJob}
          label={translate("screens/ConfirmAddLiq", "Add liquidity")}
          onSubmit={addLiquidity}
          onCancel={onCancel}
          displayCancelBtn
          title="add"
        />
      </View>
    </ThemedScrollViewV2>
  );
}

async function constructSignedAddLiqAndSend(
  addLiqForm: {
    tokenASymbol: string;
    tokenAId: number;
    tokenAAmount: BigNumber;
    tokenBSymbol: string;
    tokenBId: number;
    tokenBAmount: BigNumber;
    lmTotalTokens: string;
  },
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

      const addLiq = {
        from: [
          {
            script,
            balances: [
              {
                token: addLiqForm.tokenAId,
                amount: addLiqForm.tokenAAmount,
              },
              {
                token: addLiqForm.tokenBId,
                amount: addLiqForm.tokenBAmount,
              },
            ],
          },
        ],
        shareAddress: script,
      };

      const dfTx = await builder.liqPool.addLiquidity(addLiq, script);
      return new CTransactionSegWit(dfTx);
    };

    dispatch(
      transactionQueue.actions.push({
        sign: signer,
        title: translate(
          "screens/ConfirmAddLiq",
          "Adding {{totalToken}} {{symbolA}}-{{symbolB}} to liquidity pool",
          {
            totalToken: addLiqForm.lmTotalTokens,
            symbolA: addLiqForm.tokenASymbol,
            symbolB: addLiqForm.tokenBSymbol,
          }
        ),
        drawerMessages: {
          preparing: translate(
            "screens/OceanInterface",
            "Preparing to add liquidity…"
          ),
          waiting: translate(
            "screens/OceanInterface",
            "Adding {{totalToken}} {{symbolA}}-{{symbolB}} to liquidity pool",
            {
              totalToken: addLiqForm.lmTotalTokens,
              symbolA: addLiqForm.tokenASymbol,
              symbolB: addLiqForm.tokenBSymbol,
            }
          ),
          complete: translate(
            "screens/OceanInterface",
            "Added {{totalToken}} {{symbolA}}-{{symbolB}} to liquidity pool",
            {
              totalToken: addLiqForm.lmTotalTokens,
              symbolA: addLiqForm.tokenASymbol,
              symbolB: addLiqForm.tokenBSymbol,
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
