import { tailwind } from "@tailwind";
import { ThemedScrollView } from "@components/themed";
import { View } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import { useEffect } from "react";
import { fetchVaults } from "@store/loans";
import { useWhaleApiClient } from "@shared-contexts/WhaleContext";
import { useWalletContext } from "@shared-contexts/WalletContext";
import {
  LoanVaultLiquidated,
  LoanVaultLiquidationBatch,
} from "@defichain/whale-api-client/dist/api/loan";
import { useIsFocused } from "@react-navigation/native";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { BidCard } from "./BidCard";
import { EmptyBidsScreen } from "./EmptyBidsScreen";

export function ManageBids(): JSX.Element {
  const dispatch = useAppDispatch();
  const client = useWhaleApiClient();
  const { address } = useWalletContext();
  const blockCount = useSelector((state: RootState) => state.block.count);
  const auctions = useSelector((state: RootState) => state.auctions.auctions);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      dispatch(
        fetchVaults({
          address,
          client,
        })
      );
    }
  }, [blockCount, address, isFocused]);

  if (auctions.length === 0) {
    return <EmptyBidsScreen />;
  }

  return (
    <ThemedScrollView
      contentContainerStyle={tailwind("p-4")}
      testID="bid_cards"
    >
      {auctions.map((auction: LoanVaultLiquidated, index: number) => {
        return (
          <View key={auction.vaultId}>
            {auction.batches.map((eachBatch: LoanVaultLiquidationBatch) => {
              return (
                <BidCard
                  vaultId={auction.vaultId}
                  liquidationHeight={auction.liquidationHeight}
                  batch={eachBatch}
                  key={`${auction.vaultId}_${eachBatch.index}`}
                  testID={`bid_card_${index}`}
                />
              );
            })}
          </View>
        );
      })}
    </ThemedScrollView>
  );
}
