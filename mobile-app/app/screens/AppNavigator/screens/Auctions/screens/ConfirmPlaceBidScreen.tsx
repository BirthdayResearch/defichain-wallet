import { Dispatch, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { RootState } from "@store";
import { hasTxQueued, transactionQueue } from "@store/transaction_queue";
import {
  firstTransactionSelector,
  hasTxQueued as hasBroadcastQueued,
} from "@store/ocean";
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
import { SubmitButtonGroup } from "@components/SubmitButtonGroup";
import { ThemedScrollViewV2, ThemedViewV2 } from "@components/themed";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { SummaryTitleV2 } from "@components/SummaryTitleV2";
import { useWalletContext } from "@shared-contexts/WalletContext";
import { useAddressLabel } from "@hooks/useAddressLabel";
import { NumberRowV2 } from "@components/NumberRowV2";
import { TextRowV2 } from "@components/TextRowV2";
import { AuctionsParamList } from "../AuctionNavigator";

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
  const currentBroadcastJob = useSelector((state: RootState) =>
    firstTransactionSelector(state.ocean)
  );
  const { bidAmount, estimatedFees, totalAuctionValue, vault, batch } =
    props.route.params;

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

  function getSubmitLabel(): string {
    if (!hasPendingBroadcastJob && !hasPendingJob) {
      return "CONFIRM BID";
    }
    if (
      hasPendingBroadcastJob &&
      currentBroadcastJob !== undefined &&
      currentBroadcastJob.submitButtonLabel !== undefined
    ) {
      return currentBroadcastJob.submitButtonLabel;
    }
    return "PLACING BID";
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
      style={tailwind("py-8 px-5")}
      testID="confirm_place_bid_screen"
    >
      <ThemedViewV2 style={tailwind("flex-col pb-4 mb-4")}>
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

        <TextRowV2
          containerStyle={{
            style: tailwind("flex-row items-start w-full bg-transparent mt-6"),
            ...containerThemeOptions,
          }}
          lhs={{
            value: translate("screens/ConfirmPlaceBidScreen", "Vault ID"),
            testID: "text_vault_id_label",
            themedProps: lhsThemedProps,
          }}
          rhs={{
            value: vault.vaultId,
            testID: "text_vault_id",
            numberOfLines: 1,
            ellipsizeMode: "middle",
            themedProps: rhsThemedProps,
          }}
        />
        <TextRowV2
          containerStyle={{
            style: tailwind("flex-row items-start w-full bg-transparent mt-6"),
            ...containerThemeOptions,
          }}
          lhs={{
            value: translate("screens/ConfirmPlaceBidScreen", "Vault owner ID"),
            testID: "text_vault_owner_label",
            themedProps: lhsThemedProps,
          }}
          rhs={{
            value: vault.ownerAddress,
            testID: "text_vault_owner_id",
            numberOfLines: 1,
            ellipsizeMode: "middle",
            themedProps: rhsThemedProps,
          }}
        />
        <NumberRowV2
          containerStyle={{
            style: tailwind(
              "flex-row items-start w-full bg-transparent border-b-0.5 pb-5 mt-6"
            ),
            ...containerThemeOptions,
          }}
          lhs={{
            value: translate(
              "screens/ConfirmPlaceBidScreen",
              "Liquidation height"
            ),
            testID: "text_liquidation_height_label",
            themedProps: lhsThemedProps,
          }}
          rhs={{
            value: vault.liquidationHeight,
            testID: "text_liquidation_height",
            themedProps: rhsThemedProps,
          }}
        />
      </ThemedViewV2>

      <SubmitButtonGroup
        label={translate("screens/ConfirmPlaceBidScreen", "CONFIRM PLACE BID")}
        isDisabled={isSubmitting || hasPendingJob || hasPendingBroadcastJob}
        isProcessing={isSubmitting || hasPendingJob || hasPendingBroadcastJob}
        processingLabel={translate(
          "screens/ConfirmPlaceBidScreen",
          getSubmitLabel()
        )}
        onCancel={onCancel}
        displayCancelBtn
        onSubmit={onSubmit}
        title="bid"
      />
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
        title: translate("screens/PlaceBidScreen", "Sign Transaction"),
        description: translate(
          "screens/PlaceBidScreen",
          "Placing {{amount}} {{token}} as bid for auction.",
          {
            amount: tokenAmount.amount,
            token: displaySymbol,
          }
        ),
        drawerMessages: {
          preparing: translate(
            "screens/OceanInterface",
            "Preparing to place bid…"
          ),
          waiting: translate("screens/OceanInterface", "Placing bid…"),
          complete: translate(
            "screens/OceanInterface",
            "Bid placement completed"
          ),
        },
        onBroadcast,
      })
    );
  } catch (e) {
    logger.error(e);
  }
}
