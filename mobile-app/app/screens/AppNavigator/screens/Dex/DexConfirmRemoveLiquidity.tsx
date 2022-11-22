import { WalletAlert } from "@components/WalletAlert";
import { CTransactionSegWit } from "@defichain/jellyfish-transaction";
import { PoolPairData } from "@defichain/whale-api-client/dist/api/poolpairs";
import { WhaleWalletAccount } from "@defichain/whale-api-wallet";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import { View } from "react-native";
import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Dispatch } from "redux";
import { SubmitButtonGroup } from "@components/SubmitButtonGroup";
import { ThemedScrollViewV2, ThemedViewV2 } from "@components/themed";
import { RootState } from "@store";
import { hasTxQueued as hasBroadcastQueued } from "@store/ocean";
import { hasTxQueued, transactionQueue } from "@store/transaction_queue";
import { useStyles } from "@tailwind";
import { translate } from "@translations";
import { ScreenName } from "@screens/enum";
import { onTransactionBroadcast } from "@api/transaction/transaction_commands";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { SummaryTitle } from "@components/SummaryTitle";
import { useWalletContext } from "@shared-contexts/WalletContext";
import { useAddressLabel } from "@hooks/useAddressLabel";
import { NumberRowV2 } from "@components/NumberRowV2";
import { PricesSection } from "@components/PricesSection";
import { useTokenPrice } from "../Portfolio/hooks/TokenPrice";
import { DexParamList } from "./DexNavigator";

type Props = StackScreenProps<DexParamList, "RemoveLiquidityConfirmScreen">;

export function RemoveLiquidityConfirmScreen({ route }: Props): JSX.Element {
  const {
    pair,
    pairInfo,
    amount,
    fee,
    tokenAAmount,
    tokenBAmount,
    originScreen,
  } = route.params;
  const { tailwind } = useStyles();
  const dispatch = useAppDispatch();
  const { getTokenPrice } = useTokenPrice();
  const hasPendingJob = useSelector((state: RootState) =>
    hasTxQueued(state.transactionQueue)
  );
  const hasPendingBroadcastJob = useSelector((state: RootState) =>
    hasBroadcastQueued(state.ocean)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigation = useNavigation<NavigationProp<DexParamList>>();
  const [isOnPage, setIsOnPage] = useState<boolean>(true);
  const { address } = useWalletContext();
  const addressLabel = useAddressLabel(address);

  const sharesUsdAmount = getTokenPrice(
    pair.symbol,
    new BigNumber(amount),
    true
  );
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
    await constructSignedRemoveLiqAndSend(pair, amount, dispatch, () => {
      onTransactionBroadcast(isOnPage, navigation.dispatch);
    });
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

  const resultingPool = Number(pairInfo.amount) - Number(amount);
  return (
    <ThemedScrollViewV2 style={tailwind("py-8 px-5")}>
      <ThemedViewV2 style={tailwind("flex-col mb-9")}>
        <SummaryTitle
          iconA={pair.tokenA.displaySymbol}
          iconB={pair.tokenB.displaySymbol}
          fromAddress={address}
          fromAddressLabel={addressLabel}
          amount={amount}
          testID="text_remove_liquidity_amount"
          title={translate(
            "screens/ConfirmRemoveLiquidity",
            "You are removing LP tokens"
          )}
        />
      </ThemedViewV2>

      <ThemedViewV2
        dark={tailwind("border-mono-dark-v2-300")}
        light={tailwind("border-mono-light-v2-300")}
        style={tailwind("py-5 border-t-0.5")}
      >
        <View style={tailwind("mb-5")}>
          <NumberRowV2
            lhs={{
              value: translate(
                "screens/ConfirmRemoveLiquidity",
                "Transaction fee"
              ),
              themedProps: {
                light: tailwind("text-mono-light-v2-500"),
                dark: tailwind("text-mono-dark-v2-500"),
              },
              testID: "transaction_fee_title",
            }}
            rhs={{
              value: new BigNumber(fee).toFixed(8),
              suffix: " DFI",
              testID: "transaction_fee_title_amount",
            }}
            testID="transaction_fee"
          />
        </View>
        <NumberRowV2
          lhs={{
            value: translate("screens/ConfirmRemoveLiquidity", "Pool share"),
            themedProps: {
              light: tailwind("text-mono-light-v2-500"),
              dark: tailwind("text-mono-dark-v2-500"),
            },
            testID: "resulting_pool_share_title",
          }}
          rhs={{
            value: new BigNumber(resultingPool).toFixed(8),
            suffix: "%",
            testID: "resulting_pool_share_amount",
          }}
          testID="resulting_pool_share"
        />
      </ThemedViewV2>

      <ThemedViewV2
        dark={tailwind("border-mono-dark-v2-300")}
        light={tailwind("border-mono-light-v2-300")}
        style={tailwind("pt-5 border-t-0.5 border-b-0.5")}
      >
        <PricesSection
          key="prices"
          testID="confirm_pricerate_value"
          priceRates={[
            {
              label: translate(
                "screens/RemoveLiquidity",
                "{{token}} to receive",
                {
                  token: pair.tokenA.displaySymbol,
                }
              ),
              value: BigNumber.max(tokenAAmount, 0).toFixed(8),
              symbolUSDValue: getTokenPrice(
                pair.tokenA.symbol,
                new BigNumber(tokenAAmount)
              ),
              usdTextStyle: tailwind("text-sm"),
            },
            {
              label: translate(
                "screens/RemoveLiquidity",
                "{{token}} to receive",
                {
                  token: pair.tokenB.displaySymbol,
                }
              ),
              value: BigNumber.max(tokenBAmount, 0).toFixed(8),
              symbolUSDValue: getTokenPrice(
                pair.tokenB.symbol,
                new BigNumber(tokenBAmount)
              ),
              usdTextStyle: tailwind("text-sm"),
            },
          ]}
        />
        <NumberRowV2
          lhs={{
            value: translate(
              "screens/ConfirmRemoveLiquidity",
              "LP tokens to remove"
            ),
            themedProps: {
              light: tailwind("text-mono-light-v2-500"),
              dark: tailwind("text-mono-dark-v2-500"),
            },
            testID: "lp_tokens_to_remove_title",
          }}
          rhs={{
            value: new BigNumber(amount).toFixed(8),
            themedProps: {
              style: tailwind("font-semibold-v2 text-sm"),
            },
            testID: "lp_tokens_to_remove_amount",
            usdAmount: sharesUsdAmount.isNaN()
              ? new BigNumber(0)
              : sharesUsdAmount,
            usdTextStyle: tailwind("text-sm"),
          }}
          testID="lp_tokens_to_remove"
        />
      </ThemedViewV2>
      <View style={tailwind("py-14 px-3")}>
        <SubmitButtonGroup
          isDisabled={isSubmitting || hasPendingJob || hasPendingBroadcastJob}
          label={translate(
            "screens/ConfirmRemoveLiquidity",
            "Remove liquidity"
          )}
          onSubmit={onSubmit}
          onCancel={onCancel}
          displayCancelBtn
          title="remove"
        />
      </View>
    </ThemedScrollViewV2>
  );
}

async function constructSignedRemoveLiqAndSend(
  pair: PoolPairData,
  amount: BigNumber,
  dispatch: Dispatch<any>,
  onBroadcast: () => void
): Promise<void> {
  const tokenId = Number(pair.id);
  const symbol =
    pair?.tokenA != null && pair?.tokenB != null
      ? `${pair.tokenA.displaySymbol}-${pair.tokenB.displaySymbol}`
      : pair.symbol;

  const signer = async (
    account: WhaleWalletAccount
  ): Promise<CTransactionSegWit> => {
    const builder = account.withTransactionBuilder();
    const script = await account.getScript();

    const removeLiq = {
      script,
      tokenId,
      amount,
    };
    const dfTx = await builder.liqPool.removeLiquidity(removeLiq, script);
    return new CTransactionSegWit(dfTx);
  };

  dispatch(
    transactionQueue.actions.push({
      sign: signer,
      title: translate(
        "screens/ConfirmRemoveLiquidity",
        "Removing {{amount}} {{symbol}} from liquidity pool",
        {
          symbol: symbol,
          amount: amount.toFixed(8),
        }
      ),
      drawerMessages: {
        preparing: translate(
          "screens/OceanInterface",
          "Preparing to remove liquidity…"
        ),
        waiting: translate(
          "screens/OceanInterface",
          "Removing {{amount}} {{symbol}} from liquidity pool",
          {
            symbol: symbol,
            amount: amount.toFixed(8),
          }
        ),
        complete: translate(
          "screens/OceanInterface",
          "Removed {{amount}} {{symbol}} from liquidity pool",
          {
            symbol: symbol,
            amount: amount.toFixed(8),
          }
        ),
      },
      onBroadcast,
    })
  );
}
