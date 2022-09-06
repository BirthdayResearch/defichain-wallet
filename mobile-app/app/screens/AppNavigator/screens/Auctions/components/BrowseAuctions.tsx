import { useCallback, useRef } from "react";
import { useScrollToTop } from "@react-navigation/native";
import { tailwind } from "@tailwind";
import { ThemedFlatList, ThemedScrollView } from "@components/themed";
import { BatchCard } from "@screens/AppNavigator/screens/Auctions/components/BatchCard";
import { Platform, View } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import {
  SkeletonLoader,
  SkeletonLoaderScreen,
} from "@components/SkeletonLoader";
import {
  LoanVaultLiquidated,
  LoanVaultLiquidationBatch,
} from "@defichain/whale-api-client/dist/api/loan";
import { AuctionBatchProps } from "@store/auctions";
import {
  BottomSheetWebWithNav,
  BottomSheetWithNav,
} from "@components/BottomSheetWithNav";
import { useBottomSheet } from "@hooks/useBottomSheet";
import BigNumber from "bignumber.js";
import { LoanVault, vaultsSelector } from "@store/loans";
import { tokensSelector } from "@store/wallet";
import { QuickBid } from "./QuickBid";
import { EmptyAuction } from "./EmptyAuction";

interface Props {
  filteredAuctionBatches: AuctionBatchProps[];
}

export interface onQuickBidProps {
  batch: LoanVaultLiquidationBatch;
  vaultId: string;
  minNextBidInToken: string;
  vaultLiquidationHeight: LoanVaultLiquidated["liquidationHeight"];
  minNextBidInUSD: string;
}

export function BrowseAuctions({ filteredAuctionBatches }: Props): JSX.Element {
  const tokens = useSelector((state: RootState) =>
    tokensSelector(state.wallet)
  );
  const { hasFetchAuctionsData } = useSelector(
    (state: RootState) => state.auctions
  );
  const vaults = useSelector((state: RootState) => vaultsSelector(state.loans));

  const {
    bottomSheetRef,
    containerRef,
    dismissModal,
    expandModal,
    isModalDisplayed,
    bottomSheetScreen,
    setBottomSheetScreen,
  } = useBottomSheet();

  const onQuickBid = (props: onQuickBidProps): void => {
    const ownedToken = tokens.find((token) => token.id === props.batch.loan.id);
    const currentBalance = new BigNumber(ownedToken?.amount ?? 0);
    setBottomSheetScreen([
      {
        stackScreenName: "Quick Bid",
        option: {
          header: () => null,
          headerBackTitleVisible: false,
        },
        component: QuickBid({
          vaultId: props.vaultId,
          index: props.batch.index,
          loanTokenId: props.batch.loan.id,
          loanTokenSymbol: props.batch.loan.symbol,
          loanTokenDisplaySymbol: props.batch.loan.displaySymbol,
          onCloseButtonPress: dismissModal,
          minNextBid: new BigNumber(props.minNextBidInToken),
          minNextBidInUSD: props.minNextBidInUSD,
          currentBalance: currentBalance,
          vaultLiquidationHeight: props.vaultLiquidationHeight,
        }),
      },
    ]);
    expandModal();
  };

  return (
    <View ref={containerRef} style={tailwind("h-full")} testID="auctions_cards">
      {hasFetchAuctionsData ? (
        <>
          {filteredAuctionBatches?.length === 0 ? (
            <EmptyAuction />
          ) : (
            <BatchCards
              auctionBatches={filteredAuctionBatches}
              onQuickBid={onQuickBid}
              vaults={vaults}
            />
          )}
        </>
      ) : (
        <ThemedScrollView contentContainerStyle={tailwind("p-4")}>
          <SkeletonLoader row={6} screen={SkeletonLoaderScreen.BrowseAuction} />
        </ThemedScrollView>
      )}

      {Platform.OS === "web" && (
        <BottomSheetWebWithNav
          modalRef={containerRef}
          screenList={bottomSheetScreen}
          isModalDisplayed={isModalDisplayed}
          modalStyle={{
            position: "absolute",
            height: "240px",
            width: "375px",
            zIndex: 50,
            bottom: 0,
          }}
        />
      )}

      {Platform.OS !== "web" && (
        <BottomSheetWithNav
          modalRef={bottomSheetRef}
          screenList={bottomSheetScreen}
          snapPoints={{
            ios: ["40%"],
            android: ["40%"],
          }}
        />
      )}
    </View>
  );
}

function BatchCards({
  auctionBatches,
  vaults,
  onQuickBid,
}: {
  auctionBatches: AuctionBatchProps[];
  vaults: LoanVault[];
  onQuickBid: (props: onQuickBidProps) => void;
}): JSX.Element {
  const ref = useRef(null);
  useScrollToTop(ref);

  const RenderItems = useCallback(
    ({
      item,
      index,
    }: {
      item: AuctionBatchProps;
      index: number;
    }): JSX.Element => {
      const { auction, ...batch } = item;
      return (
        <View key={auction.vaultId}>
          <BatchCard
            vault={auction}
            batch={batch}
            key={`${auction.vaultId}_${batch.index}`}
            testID={`batch_card_${index}`}
            onQuickBid={onQuickBid}
            isVaultOwner={vaults.some(
              (vault) => vault.vaultId === auction.vaultId
            )}
          />
        </View>
      );
    },
    []
  );

  return (
    <ThemedFlatList
      contentContainerStyle={tailwind("p-4 pb-2")}
      data={auctionBatches}
      ref={ref}
      numColumns={1}
      initialNumToRender={5}
      windowSize={2}
      keyExtractor={(_item, index) => index.toString()}
      testID="available_liquidity_tab"
      renderItem={RenderItems}
    />
  );
}
