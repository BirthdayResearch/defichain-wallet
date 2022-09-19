import BigNumber from "bignumber.js";
import { View } from "@components";
import {
  ThemedFlatListV2,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
} from "@components/themed";
import { PoolPairData } from "@defichain/whale-api-client/dist/api/poolpairs";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { useTokenBestPath } from "@screens/AppNavigator/screens/Portfolio/hooks/TokenBestPath";
import React, { useEffect, useRef, useState } from "react";
import { useScrollToTop } from "@react-navigation/native";
import { WalletToken } from "@store/wallet";
import { useDebounce } from "@hooks/useDebounce";
import { AddressToken } from "@defichain/whale-api-client/dist/api/address";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import { EmptyCryptoIcon } from "@screens/AppNavigator/screens/Portfolio/assets/EmptyCryptoIcon";
import { EmptyTokensScreen } from "@screens/AppNavigator/screens/Portfolio/components/EmptyTokensScreen";
import { PoolPairIconV2 } from "@screens/AppNavigator/screens/Dex/components/PoolPairCards/PoolPairIconV2";
import {
  DexActionButton,
  DexAddRemoveLiquidityButton,
} from "@screens/AppNavigator/screens/Dex/components/DexActionButton";
import { FavoriteButton } from "@screens/AppNavigator/screens/Dex/components/FavoriteButton";
import { PriceRatesSection } from "@screens/AppNavigator/screens/Dex/components/PoolPairCards/PriceRatesSection";
import { APRSection } from "@screens/AppNavigator/screens/Dex/components/PoolPairCards/APRSection";
import { PoolSharesSection } from "@screens/AppNavigator/screens/Dex/components/PoolPairCards/PoolSharesSection";
import { useTokenPrice } from "@screens/AppNavigator/screens/Portfolio/hooks/TokenPrice";
import { useToast } from "react-native-toast-notifications";
import { useFavouritePoolpairContext } from "@contexts/FavouritePoolpairContext";
import { DexScrollable } from "../DexScrollable";
import { TotalValueLocked } from "../TotalValueLocked";

interface DexItem<T> {
  type: "your" | "available";
  data: T;
}

export enum ButtonGroupTabKey {
  AllPairs = "ALL_PAIRS",
  DFIPairs = "DFI_PAIRS",
  DUSDPairs = "DUSD_PAIRS",
  FavouritePairs = "FAVOURITE_PAIRS",
}

interface PoolPairCardProps {
  availablePairs: Array<DexItem<PoolPairData>>;
  yourPairs: Array<DexItem<WalletToken>>;
  onAdd: (data: PoolPairData, info: WalletToken) => void;
  onRemove: (data: PoolPairData, info: WalletToken) => void;
  onSwap: (data: PoolPairData) => void;
  onPress: (id: string) => void;
  type: "your" | "available";
  setIsSearching: (isSearching: boolean) => void;
  searchString: string;
  showSearchInput?: boolean;
  expandedCardIds: string[];
  setExpandedCardIds: (ids: string[]) => void;
  topLiquidityPairs: Array<DexItem<PoolPairData>>;
  newPoolsPairs: Array<DexItem<PoolPairData>>;
  activeButtonGroup: ButtonGroupTabKey;
}

export function PoolPairCards({
  availablePairs,
  onAdd,
  onRemove,
  onSwap,
  onPress,
  type,
  searchString,
  yourPairs,
  showSearchInput,
  topLiquidityPairs,
  newPoolsPairs,
  activeButtonGroup,
}: PoolPairCardProps): JSX.Element {
  const { isFavouritePoolpair, setFavouritePoolpair } =
    useFavouritePoolpairContext();
  const sortedPairs = sortPoolpairsByFavourite(
    availablePairs,
    isFavouritePoolpair
  );
  const { tvl } = useSelector((state: RootState) => state.block);
  const [filteredYourPairs, setFilteredYourPairs] =
    useState<Array<DexItem<WalletToken>>>(yourPairs);
  const debouncedSearchTerm = useDebounce(searchString, 500);
  const ref = useRef(null);
  useScrollToTop(ref);

  const pairSortingFn = (
    pairA: DexItem<WalletToken>,
    pairB: DexItem<WalletToken>
  ): number =>
    availablePairs.findIndex((x) => x.data.id === pairA.data.id) -
    availablePairs.findIndex((x) => x.data.id === pairB.data.id);

  useEffect(() => {
    if (showSearchInput === false) {
      setFilteredYourPairs(yourPairs.sort(pairSortingFn));
      return;
    }

    if (
      debouncedSearchTerm !== undefined &&
      debouncedSearchTerm.trim().length > 0
    ) {
      setFilteredYourPairs(
        yourPairs
          .filter((pair) =>
            pair.data.displaySymbol
              .toLowerCase()
              .includes(debouncedSearchTerm.trim().toLowerCase())
          )
          .sort(pairSortingFn)
      );
    } else {
      setFilteredYourPairs([]);
    }
  }, [yourPairs, debouncedSearchTerm, showSearchInput]);

  const renderItem = ({
    item,
    index,
  }: {
    item: DexItem<WalletToken | PoolPairData>;
    index: number;
  }): JSX.Element => (
    <PoolCard
      index={index}
      key={`${item.data.id}_${index}`}
      item={item}
      type={type}
      isFavouritePoolpair={isFavouritePoolpair}
      setFavouritePoolpair={setFavouritePoolpair}
      onAdd={onAdd}
      onRemove={onRemove}
      onSwap={onSwap}
      onPress={onPress}
    />
  );

  return (
    <ThemedFlatListV2
      light={tailwind("bg-mono-light-v2-100")}
      dark={tailwind("bg-mono-dark-v2-100")}
      contentContainerStyle={tailwind("pb-4", { "pt-8": type === "your" })}
      ref={ref}
      data={type === "your" ? filteredYourPairs : sortedPairs}
      numColumns={1}
      windowSize={2}
      initialNumToRender={5}
      keyExtractor={(item) => item.data.id}
      testID={
        type === "your" ? "your_liquidity_tab" : "available_liquidity_tab"
      }
      renderItem={renderItem}
      ListEmptyComponent={
        <>
          {showSearchInput === false &&
            activeButtonGroup === ButtonGroupTabKey.FavouritePairs && (
              <EmptyTokensScreen
                icon={EmptyCryptoIcon}
                containerStyle={tailwind("pt-14")}
                testID="empty_pool_pair_screen"
                title={translate("screens/DexScreen", "No favorites added")}
                subTitle={translate(
                  "screens/DexScreen",
                  "Tap the star icon to add your favorite pools here"
                )}
              />
            )}
        </>
      }
      ListHeaderComponent={
        <>
          {type === "available" &&
          showSearchInput === false &&
          activeButtonGroup === ButtonGroupTabKey.AllPairs ? (
            <>
              <TotalValueLocked tvl={tvl ?? 0} />
              {topLiquidityPairs?.length > 0 && (
                <TopLiquiditySection
                  onPress={onPress}
                  onActionPress={onSwap}
                  pairs={topLiquidityPairs}
                />
              )}
              {newPoolsPairs?.length > 0 && (
                <NewPoolsSection
                  onPress={onPress}
                  onActionPress={onAdd}
                  pairs={newPoolsPairs}
                />
              )}
              <View>
                <ThemedTextV2
                  dark={tailwind("text-mono-dark-v2-500")}
                  light={tailwind("text-mono-light-v2-500")}
                  style={tailwind(
                    "font-normal-v2 text-xs uppercase pl-10 mb-2"
                  )}
                >
                  {translate("screens/DexScreen", "Available pairs")}
                </ThemedTextV2>
              </View>
            </>
          ) : (
            <></>
          )}
        </>
      }
    />
  );
}

interface PoolCardProps {
  item: DexItem<WalletToken | PoolPairData>;
  onAdd: (data: PoolPairData, info: WalletToken) => void;
  onRemove: (data: PoolPairData, info: WalletToken) => void;
  onSwap: (data: PoolPairData, info: WalletToken) => void;
  onPress: (id: string) => void;
  type: "your" | "available";
  index: number;
  isFavouritePoolpair: (id: string) => boolean;
  setFavouritePoolpair: (id: string) => void;
}

function PoolCard({
  item,
  isFavouritePoolpair,
  setFavouritePoolpair,
  type,
  onSwap,
  onPress,
  index,
  onAdd,
  onRemove,
}: PoolCardProps): JSX.Element {
  const { calculatePriceRates } = useTokenBestPath();
  const { getTokenPrice } = useTokenPrice();
  const { poolpairs: pairs } = useSelector((state: RootState) => state.wallet);
  const blockCount = useSelector((state: RootState) => state.block.count);
  const { data: yourPair } = item;
  const isFavoritePair = isFavouritePoolpair(yourPair.id);

  const [priceRates, setPriceRates] = useState({
    aToBPrice: new BigNumber(""),
    bToAPrice: new BigNumber(""),
    estimated: new BigNumber(""),
  });

  const poolPairData = pairs.find(
    (pr) => pr.data.symbol === (yourPair as AddressToken).symbol
  );
  const mappedPair = poolPairData?.data;

  useEffect(() => {
    void getPriceRates();
  }, [mappedPair, blockCount]);

  const getPriceRates = async (): Promise<void> => {
    if (mappedPair !== undefined) {
      const priceRates = await calculatePriceRates(
        mappedPair.tokenA.id,
        mappedPair.tokenB.id,
        new BigNumber("1")
      );
      setPriceRates(priceRates);
    }
  };

  const [symbolA, symbolB] =
    mappedPair?.tokenA != null && mappedPair?.tokenB != null
      ? [mappedPair.tokenA.displaySymbol, mappedPair.tokenB.displaySymbol]
      : yourPair.symbol.split("-");

  if (mappedPair === undefined) {
    return <></>;
  }
  return (
    <ThemedTouchableOpacityV2
      style={tailwind("px-5 py-4 mb-2 rounded-lg-v2 mx-5")}
      dark={tailwind("bg-mono-dark-v2-00")}
      light={tailwind("bg-mono-light-v2-00")}
      testID={type === "your" ? "pool_pair_row_your" : "pool_pair_row"}
      onPress={() => onPress(item.data.id)}
    >
      <View testID={`pool_pair_row_${index}_${mappedPair.displaySymbol}`}>
        {type === "available" ? (
          <AvailablePool
            symbolA={symbolA}
            symbolB={symbolB}
            pair={mappedPair}
            onSwap={() => onSwap(mappedPair, yourPair as WalletToken)}
            aToBPrice={priceRates.aToBPrice}
            bToAPrice={priceRates.bToAPrice}
            isFavouritePair={isFavoritePair}
            setFavouritePoolpair={setFavouritePoolpair}
            status={mappedPair.status}
          />
        ) : (
          <YourPoolPair
            symbolA={symbolA}
            symbolB={symbolB}
            walletToken={yourPair as WalletToken}
            poolPair={mappedPair}
            onAdd={() => onAdd(mappedPair, yourPair as WalletToken)}
            onRemove={() => onRemove(mappedPair, yourPair as WalletToken)}
            walletTokenAmount={new BigNumber((yourPair as WalletToken).amount)}
            walletTokenPrice={getTokenPrice(
              yourPair.symbol,
              new BigNumber((yourPair as WalletToken).amount),
              true
            )}
          />
        )}
      </View>
    </ThemedTouchableOpacityV2>
  );
}

interface AvailablePoolProps {
  symbolA: string;
  symbolB: string;
  onSwap: () => void;
  pair: PoolPairData;
  aToBPrice: BigNumber;
  bToAPrice: BigNumber;
  isFavouritePair: boolean;
  setFavouritePoolpair: (id: string) => void;
  status: boolean;
}

export type ActionType = "SET_FAVOURITE" | "UNSET_FAVOURITE";

function AvailablePool(props: AvailablePoolProps): JSX.Element {
  const toast = useToast();
  const TOAST_DURATION = 2000;
  const showToast = (type: ActionType): void => {
    toast.hideAll();
    const toastMessage =
      type === "SET_FAVOURITE"
        ? "Pool added as favorite"
        : "Pool removed from favorites";
    toast.show(translate("screens/PoolPairDetailsScreen", toastMessage), {
      type: "wallet_toast",
      placement: "top",
      duration: TOAST_DURATION,
    });
  };
  return (
    <>
      <View
        style={tailwind("flex flex-row justify-between items-center w-full")}
      >
        <View style={tailwind("flex flex-row items-center")}>
          <PoolPairIconV2
            symbolA={props.symbolA}
            symbolB={props.symbolB}
            customSize={36}
            iconBStyle={tailwind("-ml-4 mr-2")}
          />
          <ThemedTextV2
            style={tailwind("font-semibold-v2 text-base mr-2")}
            testID={`pair_symbol_${props.symbolA}-${props.symbolB}`}
          >
            {`${props.symbolA}-${props.symbolB}`}
          </ThemedTextV2>
          <FavoriteButton
            pairId={props.pair.id}
            isFavouritePair={props.isFavouritePair}
            onPress={() => {
              showToast(
                props.isFavouritePair ? "UNSET_FAVOURITE" : "SET_FAVOURITE"
              );
              props.setFavouritePoolpair(props.pair.id);
            }}
          />
        </View>
        <DexActionButton
          label={translate("screens/DexScreen", "Swap")}
          onPress={props.onSwap}
          testID={`composite_swap_button_${props.pair.id}`}
          style={tailwind("py-2 px-3")}
          disabled={!props.status}
        />
      </View>
      <View style={tailwind("flex flex-row justify-between mt-3")}>
        <PriceRatesSection
          {...getSortedPriceRates({
            mappedPair: props.pair,
            aToBPrice: props.aToBPrice,
            bToAPrice: props.bToAPrice,
          })}
        />
        {props.pair?.apr?.total !== undefined &&
          props.pair?.apr?.total !== null && (
            <APRSection
              label={`${translate("screens/DexScreen", "APR")}`}
              value={{
                text: new BigNumber(
                  isNaN(props.pair.apr.total) ? 0 : props.pair.apr.total
                )
                  .times(100)
                  .toFixed(2),
                decimalScale: 2,
                testID: `apr_${props.symbolA}-${props.symbolB}`,
                suffix: "%",
              }}
            />
          )}
      </View>
    </>
  );
}

interface YourPoolPairProps {
  onAdd: () => void;
  onRemove: () => void;
  symbolA: string;
  symbolB: string;
  poolPair: PoolPairData;
  walletToken: WalletToken;
  walletTokenPrice: BigNumber;
  walletTokenAmount: BigNumber;
}

function YourPoolPair(props: YourPoolPairProps): JSX.Element {
  return (
    <>
      <View
        style={tailwind("flex flex-row justify-between items-center w-full")}
      >
        <View style={tailwind("flex flex-row items-center")}>
          <PoolPairIconV2
            symbolA={props.symbolA}
            symbolB={props.symbolB}
            customSize={36}
            iconBStyle={tailwind("-ml-4 mr-2")}
          />
          <ThemedTextV2
            style={tailwind("font-semibold-v2 text-base")}
            testID={`pair_symbol_${props.symbolA}-${props.symbolB}`}
          >
            {`${props.symbolA}-${props.symbolB}`}
          </ThemedTextV2>
        </View>
        <DexAddRemoveLiquidityButton
          onAdd={props.onAdd}
          onRemove={props.onRemove}
          pairToken={`${props.symbolA}-${props.symbolB}`}
        />
      </View>
      <View style={tailwind("flex flex-row justify-between mt-3")}>
        <PoolSharesSection
          walletTokenPrice={props.walletTokenPrice}
          walletTokenAmount={props.walletTokenAmount}
          tokenID={props.walletToken.id}
        />
        {props.poolPair?.apr?.total !== undefined &&
          props.poolPair?.apr?.total !== null && (
            <APRSection
              label={`${translate("screens/DexScreen", "APR")}`}
              value={{
                text: new BigNumber(
                  isNaN(props.poolPair.apr.total) ? 0 : props.poolPair.apr.total
                )
                  .times(100)
                  .toFixed(2),
                decimalScale: 2,
                testID: `apr_${props.symbolA}-${props.symbolB}`,
                suffix: "%",
              }}
            />
          )}
      </View>
    </>
  );
}

function getSortedPriceRates({
  mappedPair,
  aToBPrice,
  bToAPrice,
}: {
  mappedPair: PoolPairData;
  aToBPrice: BigNumber;
  bToAPrice: BigNumber;
}): {
  tokenA: {
    symbol: string;
    displaySymbol: string;
    priceRate: BigNumber;
  };
  tokenB: {
    symbol: string;
    displaySymbol: string;
    priceRate: BigNumber;
  };
} {
  const tokenA = {
    symbol: mappedPair.tokenA.symbol,
    displaySymbol: mappedPair.tokenA.displaySymbol,
    priceRate: aToBPrice,
  };
  const tokenB = {
    symbol: mappedPair.tokenB.symbol,
    displaySymbol: mappedPair.tokenB.displaySymbol,
    priceRate: bToAPrice,
  };

  return {
    tokenA,
    tokenB,
  };
}

function sortPoolpairsByFavourite(
  pairs: Array<DexItem<PoolPairData>>,
  isFavouritePair: (id: string) => boolean
): Array<DexItem<PoolPairData>> {
  return pairs.slice().sort((firstPair, secondPair) => {
    if (isFavouritePair(firstPair.data.id)) {
      return -1;
    }
    if (isFavouritePair(secondPair.data.id)) {
      return 1;
    }
    return 0;
  });
}

function TopLiquiditySection({
  pairs,
  onPress,
  onActionPress,
}: {
  pairs: Array<DexItem<PoolPairData>>;
  onPress: (id: string) => void;
  onActionPress: (data: PoolPairData) => void;
}): JSX.Element {
  return (
    <DexScrollable
      testID="dex_top_liquidity"
      sectionHeading="TOP LIQUIDITY"
      sectionStyle={tailwind("mb-6")}
    >
      {pairs.map((pairItem, index) => (
        <DexScrollable.Card
          key={`${pairItem.data.id}_${index}`}
          poolpair={pairItem.data}
          style={tailwind("mr-2")}
          onActionPress={() => onActionPress(pairItem.data)}
          onPress={() => onPress(pairItem.data.id)}
          label={translate("screens/DexScreen", "Swap")}
          testID={`composite_swap_${pairItem.data.id}`}
          isSwap
        />
      ))}
    </DexScrollable>
  );
}

function NewPoolsSection({
  pairs,
  onPress,
  onActionPress,
}: {
  pairs: Array<DexItem<PoolPairData | WalletToken>>;
  onPress: (id: string) => void;
  onActionPress: (data: PoolPairData, info: WalletToken) => void;
}): JSX.Element {
  return (
    <DexScrollable
      testID="dex_new_pools"
      sectionHeading="NEW POOLS"
      sectionStyle={tailwind("mb-6")}
    >
      {pairs.map((pairItem, index) => (
        <DexScrollable.Card
          key={`${pairItem.data.id}_${index}`}
          poolpair={pairItem.data as PoolPairData}
          style={tailwind("mr-2")}
          onActionPress={() =>
            onActionPress(
              pairItem.data as PoolPairData,
              pairItem.data as WalletToken
            )
          }
          onPress={() => onPress(pairItem.data.id)}
          label={translate("screens/DexScreen", "Add to LP")}
          testID={`add_liquidity_${pairItem.data.id}`}
        />
      ))}
    </DexScrollable>
  );
}
