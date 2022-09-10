import React, { useCallback, useEffect, useMemo, useState } from "react";
import { tailwind } from "@tailwind";
import {
  ThemedScrollViewV2,
  ThemedTextV2,
  ThemedViewV2,
} from "@components/themed";
import { batch, useSelector } from "react-redux";
import { RootState } from "@store";
import { StackScreenProps } from "@react-navigation/stack";
import { translate } from "@translations";
import { View } from "react-native";
import { HeaderSearchInputV2 } from "@components/HeaderSearchInputV2";
import {
  AuctionBatchProps,
  fetchAuctions,
  getAuctionBatches,
} from "@store/auctions";
import { useIsFocused } from "@react-navigation/native";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { useWhaleApiClient } from "@shared-contexts/WhaleContext";
import { fetchVaults, LoanVault, vaultsSelector } from "@store/loans";
import { useWalletContext } from "@shared-contexts/WalletContext";
import {
  SkeletonLoader,
  SkeletonLoaderScreen,
} from "@components/SkeletonLoader";
import { debounce } from "lodash";
import { AuctionsParamList } from "./AuctionNavigator";
import { BrowseAuctions, ButtonGroupTabKey } from "./components/BrowseAuctions";
import { EmptyAuction } from "./components/EmptyAuction";
import { AuctionFilterPillGroup } from "./components/AuctionFilterPillGroup";

type Props = StackScreenProps<AuctionsParamList, "AuctionScreen">;

export function AuctionsScreen({ navigation }: Props): JSX.Element {
  const { hasFetchAuctionsData } = useSelector(
    (state: RootState) => state.auctions
  );
  const vaults = useSelector((state: RootState) => vaultsSelector(state.loans));
  const yourVaultIds = useMemo(
    () => vaults.map(({ vaultId }: LoanVault) => vaultId),
    [vaults]
  );

  // Search
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchString, setSearchString] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const batches = useSelector((state: RootState) =>
    getAuctionBatches(state.auctions)
  );
  const handleFilter = useCallback(
    debounce((searchString: string) => {
      setIsSearching(false);
      if (searchString !== undefined && searchString.trim().length > 0) {
        setFilteredAuctionBatches(
          batches.filter((batch) =>
            batch.loan.displaySymbol
              .toLowerCase()
              .includes(searchString.trim().toLowerCase())
          )
        );
      } else {
        setFilteredAuctionBatches([]);
      }
    }, 500),
    [batches]
  );
  const [filteredAuctionBatches, setFilteredAuctionBatches] =
    useState<Array<AuctionBatchProps>>(batches);
  const [activeButtonGroup, setActiveButtonGroup] = useState<ButtonGroupTabKey>(
    ButtonGroupTabKey.AllBids
  );
  const blockCount = useSelector((state: RootState) => state.block.count);

  const dispatch = useAppDispatch();
  const client = useWhaleApiClient();
  const { address } = useWalletContext();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      batch(() => {
        dispatch(fetchAuctions({ client }));
        dispatch(fetchVaults({ client, address }));
      });
    }
  }, [address, blockCount, isFocused]);

  useEffect(() => {
    if (showSearchInput) {
      navigation.setOptions({
        header: (): JSX.Element => (
          <ThemedViewV2>
            <ThemedViewV2
              light={tailwind("bg-mono-light-v2-00 border-mono-light-v2-100")}
              dark={tailwind("bg-mono-dark-v2-00 border-mono-dark-v2-100")}
              style={tailwind("pb-4.5 rounded-b-2xl border-b")}
            >
              <HeaderSearchInputV2
                searchString={searchString}
                onClearInput={() => setSearchString("")}
                onChangeInput={(text: string) => {
                  setSearchString(text);
                }}
                onCancelPress={() => {
                  setSearchString("");
                  setShowSearchInput(false);
                }}
                placeholder="Search auctions"
                testID="auctions_search_input"
              />
            </ThemedViewV2>
          </ThemedViewV2>
        ),
      });
    } else {
      navigation.setOptions({
        header: undefined,
      });
      handleButtonFilter(activeButtonGroup);
    }
  }, [showSearchInput, searchString]);

  useEffect(() => {
    if (showSearchInput) {
      setIsSearching(true);
      handleFilter(searchString);
    }
  }, [searchString, hasFetchAuctionsData]);

  // Update local state - filter available pair when pairs update
  useEffect(() => {
    if (!showSearchInput) {
      handleButtonFilter(activeButtonGroup);
      return;
    }
    if (searchString !== undefined && searchString.trim().length > 0) {
      handleFilter(searchString);
    }
  }, [batches, activeButtonGroup]);

  const handleButtonFilter = useCallback(
    (buttonGroupTabKey: ButtonGroupTabKey) => {
      const filteredAuctions = batches.filter((auction) => {
        switch (buttonGroupTabKey) {
          case ButtonGroupTabKey.YourActiveBids:
            return auction?.froms.includes(address);
          case ButtonGroupTabKey.YourLeadingBids:
            return auction?.highestBid?.owner === address;
          case ButtonGroupTabKey.Outbid:
            return (
              auction?.highestBid?.owner !== address &&
              auction?.froms.includes(address)
            );
          default:
            return true;
        }
      });
      setFilteredAuctionBatches(filteredAuctions);
    },
    [batches, address]
  );

  return (
    <ThemedViewV2 testID="auctions_screen" style={tailwind("flex-1")}>
      {(!hasFetchAuctionsData || isSearching) && (
        <ThemedScrollViewV2 contentContainerStyle={tailwind("p-5")}>
          <SkeletonLoader row={6} screen={SkeletonLoaderScreen.BrowseAuction} />
        </ThemedScrollViewV2>
      )}
      {hasFetchAuctionsData && batches?.length === 0 && !isSearching && (
        <EmptyAuction
          showInfo
          title="No Auctions"
          subTitle="There are currently no collaterals available for auction."
        />
      )}
      {hasFetchAuctionsData && (
        <>
          {showSearchInput && (
            <View style={tailwind("px-10 mt-8 mb-2")}>
              <ThemedTextV2
                light={tailwind("text-mono-light-v2-700")}
                dark={tailwind("text-mono-dark-v2-700")}
                style={tailwind("font-normal-v2 text-xs")}
                testID="search_title"
              >
                {searchString?.trim().length > 0
                  ? translate(
                      "screens/AuctionsScreen",
                      "Search results for “{{input}}”",
                      { input: searchString?.trim() }
                    )
                  : translate(
                      "screens/AuctionsScreen",
                      "Search for auction with collateral token name"
                    )}
              </ThemedTextV2>
            </View>
          )}
          {batches?.length !== 0 && !showSearchInput && (
            <AuctionFilterPillGroup
              onSearchBtnPress={() => setShowSearchInput(true)}
              onButtonGroupChange={setActiveButtonGroup}
              activeButtonGroup={activeButtonGroup}
            />
          )}
          {batches?.length !== 0 &&
            (!showSearchInput || (showSearchInput && searchString !== "")) && (
              <BrowseAuctions
                activeButtonGroup={activeButtonGroup}
                showSearchInput={showSearchInput}
                filteredAuctionBatches={filteredAuctionBatches}
                yourVaultIds={yourVaultIds}
              />
            )}
        </>
      )}
    </ThemedViewV2>
  );
}
