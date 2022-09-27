import { useEffect } from "react";
import {
  ThemedFlashList,
  ThemedTextV2,
  ThemedViewV2,
} from "@components/themed";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { useSelector } from "react-redux";
import { useIsFocused } from "@react-navigation/native";
import { RootState } from "@store";
import { StackScreenProps } from "@react-navigation/stack";
import { useWhaleApiClient } from "@shared-contexts/WhaleContext";
import { VaultAuctionBatchHistory } from "@defichain/whale-api-client/dist/api/loan";
import { auctions, fetchBidHistory } from "@store/auctions";
import { useAppDispatch } from "@hooks/useAppDispatch";
import BigNumber from "bignumber.js";
import { NumericFormat as NumberFormat } from "react-number-format";
import { BidHistoryItem } from "../components/BidHistoryItem";
import { AuctionsParamList } from "../AuctionNavigator";
import { useTokenPrice } from "../../Portfolio/hooks/TokenPrice";

type BatchDetailScreenProps = StackScreenProps<
  AuctionsParamList,
  "BidHistoryScreen"
>;

export function BidHistoryScreen(props: BatchDetailScreenProps): JSX.Element {
  const { batch, vault } = props.route.params;
  const client = useWhaleApiClient();
  const dispatch = useAppDispatch();
  const blockCount = useSelector((state: RootState) => state.block.count) ?? 0;
  const isFocused = useIsFocused();
  const bidHistory = useSelector(
    (state: RootState) => state.auctions.bidHistory
  );
  const { getTokenPrice } = useTokenPrice();

  useEffect(() => {
    if (isFocused) {
      dispatch(
        fetchBidHistory({
          vaultId: vault.vaultId,
          liquidationHeight: vault.liquidationHeight,
          batchIndex: batch.index,
          client: client,
          size: 200,
        })
      );
    } else {
      dispatch(auctions.actions.resetBidHistory());
    }
  }, [blockCount, isFocused]);

  return (
    <ThemedViewV2 style={tailwind("flex-1")}>
      <ThemedFlashList
        data={bidHistory}
        contentContainerStyle={tailwind("pb-8")}
        estimatedItemSize={4}
        numColumns={1}
        ListHeaderComponent={
          <NumberFormat
            value={bidHistory?.length}
            thousandSeparator
            fixedDecimalScale
            displayType="text"
            renderText={(value) => (
              <ThemedTextV2
                light={tailwind("text-mono-light-v2-500")}
                dark={tailwind("text-mono-dark-v2-500")}
                style={tailwind("text-xs font-normal-v2 mx-10 mb-2 mt-6")}
                testID="bid_count"
              >
                {translate("components/BidHistory", "ALL BIDS")}
                {` (${value})`}
              </ThemedTextV2>
            )}
          />
        }
        renderItem={({
          item,
          index,
        }: {
          item: VaultAuctionBatchHistory;
          index: number;
        }): JSX.Element => {
          return (
            <BidHistoryItem
              bidIndex={bidHistory.length - index}
              bidAmount={item.amount}
              loanDisplaySymbol={batch.loan.displaySymbol}
              bidderAddress={item.from}
              bidAmountInUSD={getTokenPrice(
                batch.loan.symbol,
                new BigNumber(item.amount)
              )}
              bidBlockTime={item.block.time}
            />
          );
        }}
        keyExtractor={(item: VaultAuctionBatchHistory) => item.id}
      />
    </ThemedViewV2>
  );
}
