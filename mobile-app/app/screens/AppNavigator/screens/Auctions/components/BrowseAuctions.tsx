import { useCallback, useRef, useState } from "react";
import { useScrollToTop } from "@react-navigation/native";
import { tailwind } from "@tailwind";
import { ThemedFlatListV2 } from "@components/themed";
import { BatchCard } from "@screens/AppNavigator/screens/Auctions/components/BatchCard";
import { Platform, View } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import {
  LoanVaultLiquidated,
  LoanVaultLiquidationBatch,
} from "@defichain/whale-api-client/dist/api/loan";
import { AuctionBatchProps } from "@store/auctions";
import { useBottomSheet } from "@hooks/useBottomSheet";
import BigNumber from "bignumber.js";
import { tokensSelector } from "@store/wallet";
import { translate } from "@translations";
import {
  BottomSheetWebWithNavV2,
  BottomSheetWithNavV2,
} from "@components/BottomSheetWithNavV2";
import { BottomSheetHeader } from "@components/BottomSheetHeader";
import { QuickBid } from "./QuickBid";
import {
  AuctionsSortRow,
  AuctionsSortType,
  BottomSheetAssetSortList,
} from "./AuctionsSortRow";
import { EmptyAuction } from "./EmptyAuction";

interface Props {
  filteredAuctionBatches: AuctionBatchProps[];
  yourVaultIds: string[];
  activeButtonGroup: ButtonGroupTabKey;
  showSearchInput: boolean;
}

export enum ButtonGroupTabKey {
  AllBids = "ALL_BIDS",
  YourActiveBids = "YOUR_ACTIVE_BIDS",
  YourLeadingBids = "YOUR_LEADING_BIDS",
  Outbid = "OUT_BID",
}
export interface onQuickBidProps {
  batch: LoanVaultLiquidationBatch;
  vaultId: string;
  minNextBidInToken: string;
  vaultLiquidationHeight: LoanVaultLiquidated["liquidationHeight"];
  minNextBidInUSD: string;
}

export function BrowseAuctions({
  filteredAuctionBatches,
  showSearchInput,
  yourVaultIds,
  activeButtonGroup,
}: Props): JSX.Element {
  const tokens = useSelector((state: RootState) =>
    tokensSelector(state.wallet)
  );

  // Asset sort bottom sheet list
  const [assetSortType, setAssetSortType] = useState<AuctionsSortType>(
    AuctionsSortType.LeastTimeLeft
  ); // to display selected sorted type text
  const [isSorted, setIsSorted] = useState<boolean>(false); // to display acsending/descending icon

  const {
    bottomSheetRef,
    containerRef,
    dismissModal,
    expandModal,
    isModalDisplayed,
    bottomSheetScreen,
    setBottomSheetScreen,
  } = useBottomSheet();

  const assetSortBottomSheetScreen = (): void => {
    setBottomSheetScreen([
      {
        stackScreenName: "AssetSortList",
        component: BottomSheetAssetSortList({
          onButtonPress: (item: AuctionsSortType) => {
            setIsSorted(true);
            setAssetSortType(item);
            dismissModal();
          },
          selectedAssetSortType: assetSortType,
        }),
        option: {
          headerStatusBarHeight: 1,
          headerTitle: "",
          headerBackTitleVisible: false,
          header: (): JSX.Element => {
            return (
              <BottomSheetHeader
                onClose={dismissModal}
                headerText={translate(
                  "screens/AuctionsScreen",
                  "Sort Auctions"
                )}
              />
            );
          },
        },
      },
    ]);
    expandModal();
  };

  const sortTokensAssetOnType = useCallback(
    (assetSortType: AuctionsSortType): AuctionBatchProps[] => {
      let sortTokensFunc: (
        a: AuctionBatchProps,
        b: AuctionBatchProps
      ) => number;
      switch (assetSortType) {
        // TODO (Harsh) add condition for Highest Value and Lowest Value sort
        // case AuctionsSortType.HighestValue:
        //   sortTokensFunc = (a, b) =>  new BigNumber(a.auction.liquidationHeight).minus(b.auction.liquidationHeight).toNumber();
        //   break;
        // case AuctionsSortType.LowestValue:
        //   sortTokensFunc = (a, b) => a.usdAmount.minus(b.usdAmount).toNumber();
        //   break;
        case AuctionsSortType.MostTimeLeft:
          sortTokensFunc = (a, b) =>
            new BigNumber(b.auction.liquidationHeight)
              .minus(a.auction.liquidationHeight)
              .toNumber();
          break;
        case AuctionsSortType.LeastTimeLeft:
        default:
          sortTokensFunc = (a, b) =>
            new BigNumber(a.auction.liquidationHeight)
              .minus(b.auction.liquidationHeight)
              .toNumber();
      }
      return filteredAuctionBatches.sort(sortTokensFunc);
    },
    [filteredAuctionBatches, assetSortType]
  );

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
    <View ref={containerRef} style={tailwind("flex-1")} testID="auctions_cards">
      {!showSearchInput && (
        <AuctionsSortRow
          isSorted={isSorted}
          assetSortType={assetSortType}
          onPress={assetSortBottomSheetScreen}
        />
      )}

      <BatchCards
        activeButtonGroup={activeButtonGroup}
        showSearchInput={showSearchInput}
        auctionBatches={sortTokensAssetOnType(assetSortType)}
        onQuickBid={onQuickBid}
        yourVaultIds={yourVaultIds}
      />
      {Platform.OS === "web" ? (
        <BottomSheetWebWithNavV2
          modalRef={containerRef}
          screenList={bottomSheetScreen}
          isModalDisplayed={isModalDisplayed}
          // eslint-disable-next-line react-native/no-inline-styles
          modalStyle={{
            position: "absolute",
            bottom: "0",
            height: "240px",
            width: "375px",
            zIndex: 50,
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
            overflow: "hidden",
          }}
        />
      ) : (
        <BottomSheetWithNavV2
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
  yourVaultIds,
  showSearchInput,
  onQuickBid,
  activeButtonGroup,
}: {
  auctionBatches: AuctionBatchProps[];
  yourVaultIds: string[];
  showSearchInput: boolean;
  onQuickBid: (props: onQuickBidProps) => void;
  activeButtonGroup: ButtonGroupTabKey;
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
            isVaultOwner={yourVaultIds.includes(auction.vaultId)}
          />
        </View>
      );
    },
    []
  );

  const emptyScreenDetails = getEmptyScreenDetails(activeButtonGroup);
  return (
    <ThemedFlatListV2
      contentContainerStyle={tailwind("px-5 pb-2")}
      data={auctionBatches}
      ref={ref}
      numColumns={1}
      initialNumToRender={5}
      windowSize={2}
      keyExtractor={(_item, index) => index.toString()}
      ListEmptyComponent={
        <>
          {showSearchInput === false && (
            <View style={tailwind("mt-1")}>
              <EmptyAuction
                title={emptyScreenDetails.title}
                subTitle={emptyScreenDetails.subTitle}
              />
            </View>
          )}
        </>
      }
      testID="available_liquidity_tab"
      renderItem={RenderItems}
    />
  );
}

function getEmptyScreenDetails(type?: ButtonGroupTabKey): {
  title: string;
  subTitle: string;
} {
  switch (type) {
    case ButtonGroupTabKey.Outbid:
      return {
        title: "No Outbit Auctions",
        subTitle: "You have no outbids yet",
      };
    case ButtonGroupTabKey.YourActiveBids:
      return {
        title: "No Active Bids",
        subTitle: "You have no active bids yet",
      };
    case ButtonGroupTabKey.YourLeadingBids:
      return {
        title: "No Leading Bid",
        subTitle: "You have no leading bids yet",
      };
    default:
      return {
        title: "No Auctions",
        subTitle: "There are currently no collaterals available for auction.",
      };
  }
}
