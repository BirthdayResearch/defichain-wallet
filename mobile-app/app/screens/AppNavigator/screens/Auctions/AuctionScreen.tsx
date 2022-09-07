import React, { useCallback, useEffect, useMemo, useState } from "react";
import { tailwind } from "@tailwind";
import {
  ThemedIcon,
  ThemedTouchableOpacityV2,
  ThemedViewV2,
} from "@components/themed";
import { batch, useSelector } from "react-redux";
import { RootState } from "@store";
import { StackScreenProps } from "@react-navigation/stack";
import { translate } from "@translations";
import { ScrollView, View } from "react-native";
import { HeaderSearchInputV2 } from "@components/HeaderSearchInputV2";
import { useDebounce } from "@hooks/useDebounce";
import {
  AuctionBatchProps,
  auctionsSearchByTermSelector,
  fetchAuctions,
} from "@store/auctions";
import { useIsFocused } from "@react-navigation/native";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { useWhaleApiClient } from "@shared-contexts/WhaleContext";
import { fetchVaults, LoanVault, vaultsSelector } from "@store/loans";
import { useWalletContext } from "@shared-contexts/WalletContext";
import { AssetsFilterItem } from "../Portfolio/components/AssetsFilterRow";
import { AuctionsParamList } from "./AuctionNavigator";
import { BrowseAuctions } from "./components/BrowseAuctions";

export enum ButtonGroupTabKey {
  AllBids = "ALL_BIDS",
  YourActiveBids = "YOUR_ACTIVE_BIDS",
  YourLeadingBids = "YOUR_LEADING_BIDS",
  Outbid = "OUT_BID",
}

type Props = StackScreenProps<AuctionsParamList, "AuctionScreen">;

export function AuctionsScreen({ navigation }: Props): JSX.Element {
  const { auctions } = useSelector((state: RootState) => state.auctions);
  const vaults = useSelector((state: RootState) => vaultsSelector(state.loans));
  const yourVaultIds = useMemo(
    () => vaults.map(({ vaultId }: LoanVault) => vaultId),
    [vaults]
  );

  // Search
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchString, setSearchString] = useState("");
  const debouncedSearchTerm = useDebounce(searchString, 500);
  const batches = useSelector((state: RootState) =>
    auctionsSearchByTermSelector(state.auctions, debouncedSearchTerm)
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
                placeholder="Search for loan token"
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

  // Update local state - filter available pair when pairs update
  useEffect(() => {
    if (!showSearchInput) {
      handleButtonFilter(activeButtonGroup);
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
      <AuctionFilterPillGroup
        onSearchBtnPress={() => setShowSearchInput(true)}
        onButtonGroupChange={setActiveButtonGroup}
        activeButtonGroup={activeButtonGroup}
      />
      <BrowseAuctions
        filteredAuctionBatches={filteredAuctionBatches}
        yourVaultIds={yourVaultIds}
      />
    </ThemedViewV2>
  );
}

const AuctionFilterPillGroup = React.memo(
  (props: {
    onSearchBtnPress: () => void;
    onButtonGroupChange: (buttonGroupTabKey: ButtonGroupTabKey) => void;
    activeButtonGroup: ButtonGroupTabKey;
  }) => {
    const buttonGroup = [
      {
        id: ButtonGroupTabKey.AllBids,
        label: translate("screens/AuctionsScreen", "All auctions"),
        handleOnPress: () =>
          props.onButtonGroupChange(ButtonGroupTabKey.AllBids),
      },
      {
        id: ButtonGroupTabKey.YourActiveBids,
        label: translate("screens/AuctionsScreen", "Your active bids"),
        handleOnPress: () =>
          props.onButtonGroupChange(ButtonGroupTabKey.YourActiveBids),
      },
      {
        id: ButtonGroupTabKey.YourLeadingBids,
        label: translate("screens/AuctionsScreen", "Your leading bids"),
        handleOnPress: () =>
          props.onButtonGroupChange(ButtonGroupTabKey.YourLeadingBids),
      },
      {
        id: ButtonGroupTabKey.Outbid,
        label: translate("screens/AuctionsScreen", "Outbid"),
        handleOnPress: () =>
          props.onButtonGroupChange(ButtonGroupTabKey.Outbid),
      },
    ];

    return (
      <View style={tailwind("my-4")}>
        <ThemedViewV2 testID="auction_button_group">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={tailwind(
              "flex justify-between items-center flex-row px-5"
            )}
          >
            <ThemedTouchableOpacityV2
              onPress={props.onSearchBtnPress}
              style={tailwind("text-center pr-4")}
              testID="dex_search_icon"
            >
              <ThemedIcon
                iconType="Feather"
                name="search"
                size={24}
                light={tailwind("text-mono-light-v2-700")}
                dark={tailwind("text-mono-dark-v2-700")}
              />
            </ThemedTouchableOpacityV2>
            {buttonGroup.map((button, index) => (
              <AssetsFilterItem
                key={button.id}
                label={button.label}
                onPress={button.handleOnPress}
                isActive={props.activeButtonGroup === button.id}
                testID={`dex_button_group_${button.id}`}
                additionalStyles={
                  !(buttonGroup.length === index) ? tailwind("mr-3") : undefined
                }
              />
            ))}
          </ScrollView>
        </ThemedViewV2>
      </View>
    );
  }
);
