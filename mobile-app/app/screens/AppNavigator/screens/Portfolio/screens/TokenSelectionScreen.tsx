import { useRef, useState, useMemo } from "react";
import { Image } from "expo-image";
import { View, TextInput } from "react-native";
import { NumericFormat as NumberFormat } from "react-number-format";
import { useSelector } from "react-redux";
import BigNumber from "bignumber.js";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { tailwind } from "@tailwind";
import { RootState } from "@store";
import { translate } from "@translations";
import { tokensSelector, WalletToken } from "@waveshq/walletkit-ui/dist/store";
import { useDebounce } from "@hooks/useDebounce";
import { useThemeContext } from "@waveshq/walletkit-ui";
import { useTokenPrice } from "@screens/AppNavigator/screens/Portfolio/hooks/TokenPrice";
import ImageEmptyAssets from "@assets/images/send/empty-assets.png";
import {
  ThemedFlashList,
  ThemedScrollViewV2,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2,
} from "@components/themed";
import { SearchInput } from "@components/SearchInput";
import { ButtonV2 } from "@components/ButtonV2";
import {
  SkeletonLoader,
  SkeletonLoaderScreen,
} from "@components/SkeletonLoader";
import { ListRenderItemInfo } from "@shopify/flash-list";
import { DomainType, useDomainContext } from "@contexts/DomainContext";
import { PortfolioParamList } from "../PortfolioNavigator";
import { ActiveUSDValueV2 } from "../../Loans/VaultDetail/components/ActiveUSDValueV2";
import { TokenIcon } from "../components/TokenIcon";
import { TokenNameText } from "../components/TokenNameText";
import { useEvmTokenBalances } from "../hooks/EvmTokenBalances";

export interface TokenSelectionItem extends BottomSheetToken {
  usdAmount: BigNumber;
}

export interface BottomSheetToken {
  tokenId: string;
  available: BigNumber;
  token: {
    name: string;
    displaySymbol: string;
    symbol: string;
    isLPS?: boolean;
  };
  factor?: string;
  reserve?: string;
}

export function TokenSelectionScreen(): JSX.Element {
  const { isLight } = useThemeContext();
  const { domain } = useDomainContext();
  const navigation = useNavigation<NavigationProp<PortfolioParamList>>();
  const tokens = useSelector((state: RootState) =>
    tokensSelector(state.wallet),
  );
  const { evmTokens } = useEvmTokenBalances();

  const { hasFetchedToken } = useSelector((state: RootState) => state.wallet);
  const { hasFetchedEvmTokens } = useSelector((state: RootState) => state.evm);
  const [searchString, setSearchString] = useState("");
  const { getTokenPrice } = useTokenPrice();
  const debouncedSearchTerm = useDebounce(searchString, 250);

  const [isSearchFocus, setIsSearchFocus] = useState(false);
  const searchRef = useRef<TextInput>();
  const isEvmDomain = domain === DomainType.EVM;

  const filteredTokensByDomain = isEvmDomain ? evmTokens : tokens;

  const tokensWithBalance = getTokensWithBalance(
    filteredTokensByDomain,
    getTokenPrice,
  );
  const filteredTokensWithBalance = useMemo(() => {
    return filterTokensBySearchTerm(tokensWithBalance, debouncedSearchTerm);
  }, [tokensWithBalance, debouncedSearchTerm]);

  const hasFetchedDvmEvmTokens =
    hasFetchedToken || (isEvmDomain && hasFetchedEvmTokens);
  if (hasFetchedDvmEvmTokens && tokensWithBalance.length === 0) {
    return <EmptyAsset navigation={navigation} isEvmDomain={isEvmDomain} />;
  }

  return (
    <ThemedFlashList
      estimatedItemSize={4}
      testID="token_selection_screen"
      parentContainerStyle={tailwind("pb-4")}
      data={filteredTokensWithBalance}
      renderItem={({
        item,
      }: ListRenderItemInfo<TokenSelectionItem>): JSX.Element => {
        return (
          <TokenSelectionRow
            item={item}
            isEvmDomain={isEvmDomain}
            onPress={() => {
              navigation.navigate({
                name: "SendScreen",
                params: {
                  token: filteredTokensByDomain.find(
                    (t) => t.id === item.tokenId,
                  ),
                },
                merge: true,
              });
            }}
          />
        );
      }}
      ListHeaderComponent={
        <ThemedViewV2 style={tailwind("mx-5 mt-8")}>
          <SearchInput
            value={searchString}
            containerStyle={tailwind([
              "border-0.5",
              isSearchFocus
                ? {
                    "border-mono-light-v2-800": isLight,
                    "border-mono-dark-v2-800": !isLight,
                  }
                : {
                    "border-mono-light-v2-00": isLight,
                    "border-mono-dark-v2-00": !isLight,
                  },
            ])}
            inputStyle={{
              light: tailwind("text-mono-light-v2-900"),
              dark: tailwind("text-mono-dark-v2-900"),
            }}
            placeholder={translate(
              "screens/TokenSelectionScreen",
              "Search token",
            )}
            showClearButton={debouncedSearchTerm !== ""}
            onClearInput={() => {
              setSearchString("");
              searchRef?.current?.focus();
            }}
            onChangeText={(text: string) => {
              setSearchString(text);
            }}
            onFocus={() => {
              setIsSearchFocus(true);
            }}
            onBlur={() => {
              setIsSearchFocus(false);
            }}
            testID="token_search_input"
            ref={searchRef}
          />

          {(!hasFetchedDvmEvmTokens || debouncedSearchTerm.trim() === "") && (
            <ThemedTextV2
              style={tailwind("text-xs pl-5 mt-6 mb-2 font-normal-v2")}
              light={tailwind("text-mono-light-v2-500")}
              dark={tailwind("text-mono-dark-v2-500")}
            >
              {translate("screens/TokenSelectionScreen", "AVAILABLE")}
            </ThemedTextV2>
          )}

          {hasFetchedDvmEvmTokens && debouncedSearchTerm.trim() !== "" && (
            <ThemedTextV2
              style={tailwind("text-xs pl-5 mt-6 mb-2 font-normal-v2")}
              light={tailwind("text-mono-light-v2-700")}
              dark={tailwind("text-mono-dark-v2-700")}
              testID="empty_search_result_text"
            >
              {translate(
                "screens/TokenSelectionScreen",
                "Search results for “{{searchTerm}}”",
                { searchTerm: debouncedSearchTerm },
              )}
            </ThemedTextV2>
          )}

          {!hasFetchedDvmEvmTokens && (
            <SkeletonLoader
              row={5}
              screen={SkeletonLoaderScreen.TokenSelection}
            />
          )}
        </ThemedViewV2>
      }
      keyExtractor={(item, index) => `${index}`}
    />
  );
}

interface TokenSelectionRowProps {
  item: TokenSelectionItem;
  onPress: any;
  isEvmDomain: boolean;
}

function TokenSelectionRow({
  item,
  onPress,
  isEvmDomain,
}: TokenSelectionRowProps): JSX.Element {
  return (
    <ThemedTouchableOpacityV2
      disabled={new BigNumber(item.available).lte(0)}
      onPress={onPress}
      light={tailwind("bg-mono-light-v2-00")}
      dark={tailwind("bg-mono-dark-v2-00")}
      style={tailwind(
        "mx-5 mb-2 p-4 flex flex-row items-center justify-between rounded-lg",
      )}
      testID={`select_${item.token.displaySymbol}`}
    >
      <View style={tailwind("w-7/12 flex flex-row items-center")}>
        <TokenIcon
          testID={`${item.token.displaySymbol}_icon`}
          token={{
            isLPS: item.token.isLPS,
            displaySymbol: item.token.displaySymbol,
            id: item.tokenId,
          }}
          isEvmToken={isEvmDomain}
          size={36}
        />
        <TokenNameText
          displaySymbol={item.token.displaySymbol}
          name={item.token.name}
          testID={item.token.displaySymbol}
        />
      </View>
      <View style={tailwind("flex flex-col items-end")}>
        <NumberFormat
          value={item.available.toFixed(8)}
          thousandSeparator
          displayType="text"
          renderText={(value) => (
            <ThemedTextV2
              style={tailwind("font-semibold-v2 text-xs")}
              testID={`select_${item.token.displaySymbol}_value`}
            >
              {value}
            </ThemedTextV2>
          )}
        />
        <ActiveUSDValueV2
          price={item.usdAmount}
          containerStyle={tailwind("justify-end")}
        />
      </View>
    </ThemedTouchableOpacityV2>
  );
}

function EmptyAsset({
  navigation,
  isEvmDomain,
}: {
  navigation: NavigationProp<PortfolioParamList>;
  isEvmDomain: boolean;
}): JSX.Element {
  return (
    <ThemedScrollViewV2
      contentContainerStyle={tailwind(
        "flex items-center justify-between mx-12 h-full",
      )}
    >
      <View style={tailwind("flex items-center")}>
        <Image
          source={ImageEmptyAssets}
          style={[
            tailwind("mt-12"),
            {
              width: 204,
              height: 96,
            },
          ]}
        />
        <ThemedTextV2
          testID="no_asset_text"
          style={tailwind("font-semibold-v2 text-xl mt-8")}
        >
          {translate("screens/TokenSelectionScreen", "No assets found")}
        </ThemedTextV2>
        <ThemedTextV2
          testID="no_asset_sub_text"
          style={tailwind("mt-2 font-normal-v2")}
        >
          {translate(
            "screens/TokenSelectionScreen",
            "Add assets to get started",
          )}
        </ThemedTextV2>
      </View>
      {!isEvmDomain && (
        <ButtonV2
          onPress={() => navigation.navigate("GetDFIScreen" as any)}
          styleProps="w-full mb-14 pb-1"
          label={translate("screens/GetDFIScreen", "Get DFI")}
        />
      )}
    </ThemedScrollViewV2>
  );
}

function getTokensWithBalance(
  tokens: WalletToken[],
  getTokenPrice: (
    symbol: string,
    amount: BigNumber,
    isLPS?: boolean | undefined,
  ) => BigNumber,
): TokenSelectionItem[] {
  const reservedFees = 0.1;
  const filteredTokens: TokenSelectionItem[] = [];

  tokens.forEach((t) => {
    const available = new BigNumber(
      t.displaySymbol === "DFI" && t.id !== "0_evm"
        ? new BigNumber(t.amount).minus(reservedFees).toFixed(8)
        : t.amount,
    );

    if (available.isLessThanOrEqualTo(0) || t.id === "0" || t.id === "0_utxo") {
      return;
    }

    const activePrice = getTokenPrice(t.symbol, new BigNumber("1"), t.isLPS);
    const token: TokenSelectionItem = {
      tokenId: t.id,
      available,
      token: {
        name: t.name,
        displaySymbol: t.displaySymbol,
        symbol: t.symbol,
        isLPS: t.isLPS,
      },
      usdAmount: new BigNumber(available).multipliedBy(activePrice),
    };
    filteredTokens.push(token);
  });

  return filteredTokens.sort((a, b) =>
    b.usdAmount.minus(a.usdAmount).toNumber(),
  );
}

function filterTokensBySearchTerm(
  tokens: TokenSelectionItem[],
  searchTerm: string,
): TokenSelectionItem[] {
  return tokens.filter((t) =>
    [t.token.displaySymbol, t.token.name].some((searchItem) =>
      searchItem.toLowerCase().includes(searchTerm.trim().toLowerCase()),
    ),
  );
}
