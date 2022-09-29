import { useCallback, useRef, useState } from "react";
import { useScrollToTop } from "@react-navigation/native";
import { tailwind } from "@tailwind";
import { BatchCard } from "@screens/AppNavigator/screens/Auctions/components/BatchCard";
import { Platform, View } from "react-native";
import {
  LoanVaultLiquidated,
  LoanVaultLiquidationBatch,
} from "@defichain/whale-api-client/dist/api/loan";
import { AuctionBatchProps } from "@store/auctions";
import { useBottomSheet } from "@hooks/useBottomSheet";
import BigNumber from "bignumber.js";
import { translate } from "@translations";
import {
  BottomSheetWebWithNavV2,
  BottomSheetWithNavV2,
} from "@components/BottomSheetWithNavV2";
import { BottomSheetHeader } from "@components/BottomSheetHeader";
import { ThemedFlashList } from "@components/themed/ThemedFlashList";
import { QuickBid } from "./QuickBid";
import {
  AuctionsSortRow,
  AuctionsSortType,
  BottomSheetAssetSortList,
} from "./AuctionsSortRow";
import { EmptyAuction } from "./EmptyAuction";

interface Props {
  batches: AuctionBatchProps[];
  filteredAuctionBatches: AuctionBatchProps[];
  yourVaultIds: string[];
  activeButtonGroup: ButtonGroupTabKey;
  showSearchInput: boolean;
  searchString: string;
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
  minNextBidInToken: BigNumber;
  vaultLiquidationHeight: LoanVaultLiquidated["liquidationHeight"];
  minNextBidInUSD: BigNumber;
  totalCollateralsValueInUSD: BigNumber;
}

export function BrowseAuctions({
  batches,
  filteredAuctionBatches,
  showSearchInput,
  searchString,
  yourVaultIds,
  activeButtonGroup,
}: Props): JSX.Element {
  // Asset sort bottom sheet list
  const [assetSortType, setAssetSortType] = useState<AuctionsSortType>(
    AuctionsSortType.LeastTimeLeft
  ); // to display selected sorted type text
  const [isSorted, setIsSorted] = useState<boolean>(false); // to display acsending/descending icon
  const [isQuickBidOpen, setQuickBidOpen] = useState<boolean>(false);

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
                headerText={translate("screens/AuctionScreen", "Sort Auctions")}
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
        // TODO enable filter after implementing total usd collateral value calculation on api side
        // case AuctionsSortType.HighestValue:
        //   sortTokensFunc = (a, b) =>
        //     new BigNumber(b.totalCollateralsValueInUSD)
        //       .minus(a.totalCollateralsValueInUSD)
        //       .toNumber();
        //   break;
        // case AuctionsSortType.LowestValue:
        //   sortTokensFunc = (a, b) =>
        //     new BigNumber(a.totalCollateralsValueInUSD)
        //       .minus(b.totalCollateralsValueInUSD)
        //       .toNumber();
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
    setQuickBidOpen(true);
    setBottomSheetScreen([
      {
        stackScreenName: "Quick Bid",
        option: {
          headerStatusBarHeight: 1,
          headerTitle: "",
          headerBackTitleVisible: false,
          header: (): JSX.Element => {
            return (
              <BottomSheetHeader
                headerStyle={{
                  style: tailwind(
                    "text-lg font-semibold-v2 text-center mt-5 pt-0.5"
                  ),
                  light: tailwind("text-mono-light-v2-1000"),
                  dark: tailwind("text-mono-dark-v2-1000"),
                }}
                containerStyle={tailwind("pb-4")}
                onClose={() => {
                  dismissModal();
                  setQuickBidOpen(false);
                }}
                headerText={translate("components/QuickBid", "Quick Bid")}
              />
            );
          },
        },
        component: QuickBid({
          vaultId: props.vaultId,
          index: props.batch.index,
          loanTokenId: props.batch.loan.id,
          loanTokenDisplaySymbol: props.batch.loan.displaySymbol,
          onCloseButtonPress: () => {
            dismissModal();
            setQuickBidOpen(false);
          },
          minNextBid: props.minNextBidInToken.toFixed(8),
          minNextBidInUSD: props.minNextBidInUSD,
          totalCollateralsValueInUSD: props.totalCollateralsValueInUSD,
          vaultLiquidationHeight: props.vaultLiquidationHeight,
        }),
      },
    ]);
    expandModal();
  };

  if (batches?.length === 0 || (showSearchInput && searchString === "")) {
    return <></>;
  }

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
            height: "404px",
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
            ios: [isQuickBidOpen ? "60%" : "45%"],
            android: [isQuickBidOpen ? "60%" : "45%"],
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
      const { auction, collateralTokenSymbols, ...batch } = item;
      return (
        <BatchCard
          vault={auction}
          batch={batch}
          collateralTokenSymbols={collateralTokenSymbols}
          key={`${auction.vaultId}_${batch.index}`}
          testID={`batch_card_${index}`}
          onQuickBid={onQuickBid}
          isVaultOwner={yourVaultIds.includes(auction.vaultId)}
        />
      );
    },
    []
  );

  const emptyScreenDetails = getEmptyScreenDetails(activeButtonGroup);
  return (
    <ThemedFlashList
      contentContainerStyle={tailwind("pb-2")}
      data={auctionBatches}
      ref={ref}
      numColumns={1}
      estimatedItemSize={4}
      keyExtractor={(_item, index) => index.toString()}
      ListEmptyComponent={
        <>
          {showSearchInput === false && (
            <View style={tailwind("mx-5 mt-1")}>
              <EmptyAuction
                title={emptyScreenDetails.title}
                subtitle={emptyScreenDetails.subtitle}
              />
            </View>
          )}
        </>
      }
      testID="auction_lists"
      renderItem={RenderItems}
    />
  );
}

function getEmptyScreenDetails(type?: ButtonGroupTabKey): {
  title: string;
  subtitle: string;
} {
  switch (type) {
    case ButtonGroupTabKey.Outbid:
      return {
        title: "No Outbid Auctions",
        subtitle: "You have no outbids yet",
      };
    case ButtonGroupTabKey.YourActiveBids:
      return {
        title: "No Active Bids",
        subtitle: "You have no active bids yet",
      };
    case ButtonGroupTabKey.YourLeadingBids:
      return {
        title: "No Leading Bids",
        subtitle: "You have no leading bids yet",
      };
    default:
      return {
        title: "No Auctions",
        subtitle: "There are currently no collaterals available for auction.",
      };
  }
}
