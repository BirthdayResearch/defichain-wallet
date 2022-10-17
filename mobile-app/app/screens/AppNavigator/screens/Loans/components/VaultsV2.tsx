import { tailwind } from "@tailwind";
import {
  ThemedIcon,
  ThemedScrollViewV2,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
} from "@components/themed";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchCollateralTokens,
  fetchVaults,
  LoanVault,
  vaultsSelector,
} from "@store/loans";
import { useWhaleApiClient } from "@shared-contexts/WhaleContext";
import { useWalletContext } from "@shared-contexts/WalletContext";
import {
  NavigationProp,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import { useAppDispatch } from "@hooks/useAppDispatch";
import {
  SkeletonLoader,
  SkeletonLoaderScreen,
} from "@components/SkeletonLoader";
import { SearchInputV2 } from "@components/SearchInputV2";
import { translate } from "@translations";
import { Platform, TextInput, View } from "react-native";
import { useDebounce } from "@hooks/useDebounce";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { LoanParamList } from "@screens/AppNavigator/screens/Loans/LoansNavigator";
import {
  BottomSheetNavScreen,
  BottomSheetWebWithNavV2,
  BottomSheetWithNavV2,
} from "@components/BottomSheetWithNavV2";
import { useBottomSheet } from "@hooks/useBottomSheet";
import { LoanToken } from "@defichain/whale-api-client/dist/api/loan";
import { EmptyVaultV2 } from "./EmptyVaultV2";
import { PriceOracleInfo } from "./PriceOracleInfo";
import { BottomSheetModalInfo } from "../../../../../components/BottomSheetModalInfo";
import { VaultCardV2 } from "./VaultCardV2";
import { BottomSheetLoanTokensList } from "./BottomSheetLoanTokensList";

interface VaultsProps {
  scrollRef?: React.Ref<any>;
}

export function VaultsV2(props: VaultsProps): JSX.Element {
  const dispatch = useAppDispatch();
  const client = useWhaleApiClient();
  const isFocused = useIsFocused();
  const { address } = useWalletContext();
  const { isLight } = useThemeContext();
  const navigation = useNavigation<NavigationProp<LoanParamList>>();
  const blockCount = useSelector((state: RootState) => state.block.count);
  const vaults = useSelector((state: RootState) => vaultsSelector(state.loans));
  const { hasFetchedVaultsData } = useSelector(
    (state: RootState) => state.loans
  );

  const [searchString, setSearchString] = useState("");
  const [isSearchFocus, setIsSearchFocus] = useState(false);
  const debouncedSearchTerm = useDebounce(searchString, 250);
  const searchRef = useRef<TextInput>();

  const [bottomSheetScreen, setBottomSheetScreen] = useState<
    BottomSheetNavScreen[]
  >([]);

  const {
    bottomSheetRef,
    containerRef,
    dismissModal,
    expandModal,
    isModalDisplayed,
  } = useBottomSheet();

  const BottomSheetHeader = {
    headerStatusBarHeight: 2,
    headerTitle: "",
    headerBackTitleVisible: false,
    headerStyle: tailwind("rounded-t-xl-v2 border-b-0", {
      "bg-mono-light-v2-100": isLight,
      "bg-mono-dark-v2-100": !isLight,
    }),
    headerRight: (): JSX.Element => {
      return (
        <ThemedTouchableOpacityV2
          style={tailwind("mr-5", {
            "mt-4 -mb-4": Platform.OS === "ios",
            "mt-1.5": Platform.OS === "android",
          })}
          onPress={dismissModal}
          testID="close_bottom_sheet_button"
        >
          <ThemedIcon iconType="Feather" name="x-circle" size={22} />
        </ThemedTouchableOpacityV2>
      );
    },
    headerLeft: () => <></>,
  };
  const title = "Price Oracles";
  const description =
    "Loans and vaults use aggregated market prices outside the blockchain (called price oracles)";

  const oraclePriceSheetSnapPoints = {
    ios: ["30%"],
    android: ["35%"],
  };
  const [snapPoints, setSnapPoints] = useState(oraclePriceSheetSnapPoints);
  const onBottomSheetOraclePriceSelect = (): void => {
    setSnapPoints(oraclePriceSheetSnapPoints);
    setBottomSheetScreen([
      {
        stackScreenName: "OraclePriceInfo",
        component: BottomSheetModalInfo({
          title,
          description,
        }),
        option: BottomSheetHeader,
      },
    ]);
    expandModal();
  };

  const onBottomSheetLoansTokensListSelect = ({
    onPress,
    loanTokens,
  }: {
    onPress: (item: LoanToken) => void;
    loanTokens: LoanToken[];
  }): void => {
    setSnapPoints({ ios: ["75%"], android: ["70%"] });
    setBottomSheetScreen([
      {
        stackScreenName: "LoanTokensList",
        component: BottomSheetLoanTokensList({ onPress, loanTokens, isLight }),
        option: BottomSheetHeader,
      },
    ]);
    expandModal();
  };

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

  useEffect(() => {
    dispatch(fetchCollateralTokens({ client }));
  }, []);

  const filteredTokensWithBalance = useMemo(() => {
    return filterVaultsBySearchTerm(vaults, debouncedSearchTerm, isSearchFocus);
  }, [vaults, debouncedSearchTerm, isSearchFocus]);

  const inSearchMode = useMemo(() => {
    return isSearchFocus || debouncedSearchTerm !== "";
  }, [isSearchFocus, debouncedSearchTerm]);

  if (!hasFetchedVaultsData) {
    return (
      <View style={tailwind("mt-1")}>
        <SkeletonLoader row={3} screen={SkeletonLoaderScreen.Vault} />
      </View>
    );
  } else if (vaults?.length === 0) {
    return <EmptyVaultV2 handleRefresh={() => {}} isLoading={false} />;
  }

  return (
    <View ref={containerRef} style={tailwind("flex-1")}>
      <ThemedScrollViewV2
        contentContainerStyle={tailwind("px-5 py-8 w-full")}
        ref={props.scrollRef}
      >
        <View style={tailwind("flex-col w-full")}>
          <View style={tailwind("flex-row flex w-full mb-4 items-center")}>
            <SearchInputV2
              ref={searchRef}
              value={searchString}
              showClearButton={debouncedSearchTerm !== ""}
              placeholder={translate("screens/LoansScreen", "Search vault")}
              containerStyle={tailwind("flex-1", [
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
            />
            {!inSearchMode && (
              <CreateVaultButton
                onPress={() =>
                  navigation.navigate({
                    name: "CreateVaultScreen",
                    params: {},
                    merge: true,
                  })
                }
              />
            )}
          </View>
          {inSearchMode && (
            <ThemedTextV2
              style={tailwind("text-xs pl-5 my-4 font-normal-v2")}
              light={tailwind("text-mono-light-v2-700")}
              dark={tailwind("text-mono-dark-v2-700")}
              testID="empty_search_result_text"
            >
              {debouncedSearchTerm.trim() === ""
                ? translate("screens/LoansScreen", "Search with vault ID")
                : translate(
                    "screens/LoansScreen",
                    "Search results for “{{searchTerm}}”",
                    { searchTerm: debouncedSearchTerm }
                  )}
            </ThemedTextV2>
          )}
        </View>

        {filteredTokensWithBalance.map((vault, index) => {
          return (
            <VaultCardV2
              testID={`vault_card_${index}`}
              key={index}
              vault={vault}
              dismissModal={dismissModal}
              expandModal={expandModal}
              setBottomSheetScreen={setBottomSheetScreen}
              setSnapPoints={setSnapPoints}
              onBottomSheetLoansTokensListSelect={
                onBottomSheetLoansTokensListSelect
              }
            />
          );
        })}

        {!inSearchMode && (
          <PriceOracleInfo
            onPress={onBottomSheetOraclePriceSelect}
            text="All prices displayed are from price oracles."
          />
        )}

        {Platform.OS === "web" && (
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
        )}

        {Platform.OS !== "web" && (
          <BottomSheetWithNavV2
            modalRef={bottomSheetRef}
            screenList={bottomSheetScreen}
            snapPoints={snapPoints}
          />
        )}
      </ThemedScrollViewV2>
    </View>
  );
}

function CreateVaultButton(props: { onPress: () => void }): JSX.Element {
  return (
    <ThemedTouchableOpacityV2
      style={tailwind(
        "w-10 h-10 ml-3 rounded-full items-center justify-center"
      )}
      light={tailwind("bg-mono-light-v2-900")}
      dark={tailwind("bg-mono-dark-v2-900")}
      onPress={props.onPress}
      testID="button_create_vault"
    >
      <ThemedIcon
        iconType="Feather"
        name="plus"
        size={24}
        light={tailwind("text-mono-light-v2-00")}
        dark={tailwind("text-mono-dark-v2-00")}
      />
    </ThemedTouchableOpacityV2>
  );
}

function filterVaultsBySearchTerm(
  vaults: LoanVault[],
  searchTerm: string,
  isFocused: boolean
): LoanVault[] {
  if (searchTerm === "") {
    return isFocused ? [] : vaults;
  }
  return vaults.filter((t) => {
    // TODO: Add tokens search in next release
    // const vault = t as LoanVaultActive;
    // const symbols =
    //   vault.collateralAmounts !== undefined
    //     ? vault.collateralAmounts.map((value) => value.displaySymbol)
    //     : [];
    return [t.vaultId].some((searchItem) =>
      searchItem.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );
  });
}
