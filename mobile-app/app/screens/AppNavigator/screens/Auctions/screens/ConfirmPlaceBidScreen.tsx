import { Dispatch, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { RootState } from "@store";
import { hasTxQueued, transactionQueue } from "@store/transaction_queue";
import { hasTxQueued as hasBroadcastQueued } from "@store/ocean";
import { onTransactionBroadcast } from "@api/transaction/transaction_commands";
import {
  CTransactionSegWit,
  PlaceAuctionBid,
} from "@defichain/jellyfish-transaction/dist";
import { WhaleWalletAccount } from "@defichain/whale-api-wallet";
import {
  NativeLoggingProps,
  useLogger,
} from "@shared-contexts/NativeLoggingProvider";
import { ThemedScrollViewV2, ThemedTextV2 } from "@components/themed";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { SummaryTitleV2 } from "@components/SummaryTitleV2";
import { useWalletContext } from "@shared-contexts/WalletContext";
import { useAddressLabel } from "@hooks/useAddressLabel";
import { NumberRowV2 } from "@components/NumberRowV2";
import { SubmitButtonGroupV2 } from "@components/SubmitButtonGroupV2";
import { View } from "@components";
import { AuctionsParamList } from "../AuctionNavigator";
import { useAuctionTime } from "../hooks/AuctionTimeLeft";
import { AuctionVaultDetails } from "../components/AuctionVaultDetails";

type Props = StackScreenProps<AuctionsParamList, "ConfirmPlaceBidScreen">;

export function ConfirmPlaceBidScreen(props: Props): JSX.Element {
  const navigation = useNavigation<NavigationProp<AuctionsParamList>>();
  const dispatch = useAppDispatch();
  const logger = useLogger();
  const hasPendingJob = useSelector((state: RootState) =>
    hasTxQueued(state.transactionQueue)
  );
  const hasPendingBroadcastJob = useSelector((state: RootState) =>
    hasBroadcastQueued(state.ocean)
  );
  const { bidAmount, estimatedFees, totalAuctionValue, vault, batch } =
    props.route.params;
  const blockCount = useSelector((state: RootState) => state.block.count) ?? 0;
  const { blocksRemaining } = useAuctionTime(
    vault.liquidationHeight,
    blockCount
  );

  const { address } = useWalletContext();
  const addressLabel = useAddressLabel(address);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOnPage, setIsOnPage] = useState(true);

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
    await constructSignedBidAndSend(
      vault.vaultId,
      batch.index,
      {
        amount: bidAmount,
        token: Number(batch.loan.id),
      },
      batch.loan.displaySymbol,
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
      navigation.navigate({
        name: "PlaceBidScreen",
        params: {
          batch,
          vault,
        },
        merge: true,
      });
    }
  }

  const containerThemeOptions = {
    light: tailwind("bg-transparent border-mono-light-v2-300"),
    dark: tailwind("bg-transparent border-mono-dark-v2-300"),
  };
  const lhsThemedProps = {
    light: tailwind("text-mono-light-v2-500"),
    dark: tailwind("text-mono-dark-v2-500"),
  };
  const rhsThemedProps = {
    light: tailwind("text-mono-light-v2-900"),
    dark: tailwind("text-mono-dark-v2-900"),
  };

  return (
    <ThemedScrollViewV2
      contentContainerStyle={tailwind("pt-8 px-5 pb-14")}
      style={tailwind("flex-1")}
      testID="confirm_place_bid_screen"
    >
      <SummaryTitleV2
        title={translate("screens/ConfirmPlaceBidScreen", "You are bidding")}
        amount={bidAmount}
        testID="text_bid_amount_title"
        iconA={batch.loan.displaySymbol}
        fromAddress={address}
        fromAddressLabel={addressLabel}
        amountTextStyle="text-xl"
      />
      <NumberRowV2
        containerStyle={{
          style: tailwind(
            "flex-row items-start w-full bg-transparent border-t-0.5 pt-5 mt-8"
          ),
          ...containerThemeOptions,
        }}
        lhs={{
          value: translate("screens/PlaceBidScreen", "Transaction fee"),
          testID: "transaction_fee_label",
          themedProps: lhsThemedProps,
        }}
        rhs={{
          value: estimatedFees.toFixed(8),
          suffix: " DFI",
          testID: "transaction_fee_value",
          themedProps: rhsThemedProps,
        }}
      />

      <NumberRowV2
        containerStyle={{
          style: tailwind(
            "flex-row items-start w-full bg-transparent border-t-0.5 pt-5 mt-6"
          ),
          ...containerThemeOptions,
        }}
        lhs={{
          value: translate(
            "screens/ConfirmPlaceBidScreen",
            "Total auction value"
          ),
          testID: "total_auction_label",
          themedProps: lhsThemedProps,
        }}
        rhs={{
          value: totalAuctionValue,
          prefix: "$",
          testID: "total_auction_value",
          themedProps: rhsThemedProps,
        }}
      />

      <AuctionVaultDetails testID="confirm_bid" vault={vault} />

      <View style={tailwind("pt-14 px-7")}>
        {blocksRemaining === 0 && (
          <ThemedTextV2
            light={tailwind("text-red-v2")}
            dark={tailwind("text-red-v2")}
            style={tailwind(
              "text-red-v2 text-center text-xs font-normal-v2 mb-4"
            )}
          >
            {translate("screens/PlaceBidScreen", "Auction timeout")}
          </ThemedTextV2>
        )}
        <ThemedTextV2
          light={tailwind("text-mono-light-v2-500")}
          dark={tailwind("text-mono-dark-v2-500")}
          style={tailwind("text-center text-xs font-normal-v2")}
        >
          {translate(
            "screens/ConfirmPlaceBidScreen",
            "Amount will be deducted from your current wallet"
          )}
        </ThemedTextV2>
        <SubmitButtonGroupV2
          isDisabled={
            isSubmitting ||
            hasPendingJob ||
            hasPendingBroadcastJob ||
            blocksRemaining === 0
          }
          isCancelDisabled={false}
          label={translate("screens/ConfirmPlaceBidScreen", "Place bid")}
          onSubmit={onSubmit}
          onCancel={onCancel}
          title="bid"
          displayCancelBtn
          buttonStyle="mt-5 mb-7"
        />
      </View>
    </ThemedScrollViewV2>
  );
}

async function constructSignedBidAndSend(
  vaultId: PlaceAuctionBid["vaultId"],
  index: PlaceAuctionBid["index"],
  tokenAmount: PlaceAuctionBid["tokenAmount"],
  displaySymbol: string,
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
      const bid: PlaceAuctionBid = {
        from: script,
        vaultId,
        index,
        tokenAmount,
      };
      const dfTx = await builder.loans.placeAuctionBid(bid, script);

      return new CTransactionSegWit(dfTx);
    };

    dispatch(
      transactionQueue.actions.push({
        sign: signer,
        title: translate(
          "screens/ConfirmPlaceBidScreen",
          "Placing {{amount}} {{token}} bid",
          { amount: tokenAmount.amount, token: displaySymbol }
        ),
        drawerMessages: {
          preparing: translate(
            "screens/ConfirmPlaceBidScreen",
            "Preparing placing {{amount}} {{token}} bid",
            { amount: tokenAmount.amount, token: displaySymbol }
          ),
          waiting: translate(
            "screens/ConfirmPlaceBidScreen",
            "Placing {{amount}} {{token}} bid",
            { amount: tokenAmount.amount, token: displaySymbol }
          ),
          complete: translate(
            "screens/ConfirmPlaceBidScreen",
            "Placed {{amount}} {{token}} bid",
            { amount: tokenAmount.amount, token: displaySymbol }
          ),
        },
        onBroadcast,
      })
    );
  } catch (e) {
    logger.error(e);
  }
}
