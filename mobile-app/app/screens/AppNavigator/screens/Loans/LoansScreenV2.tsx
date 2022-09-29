import { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { tailwind } from "@tailwind";
import {
  ThemedIcon,
  ThemedScrollViewV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2,
} from "@components/themed";
import {
  SkeletonLoader,
  SkeletonLoaderScreen,
} from "@components/SkeletonLoader";
import { batch, useSelector } from "react-redux";
import { RootState } from "@store";
import {
  fetchLoanSchemes,
  fetchLoanTokens,
  fetchVaults,
  loanTokensSelector,
  vaultsSelector,
} from "@store/loans";
import { useWhaleApiClient } from "@shared-contexts/WhaleContext";
import { useWalletContext } from "@shared-contexts/WalletContext";
import { LoanToken } from "@defichain/whale-api-client/dist/api/loan";
import {
  NavigationProp,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { translate } from "@translations";

import { useThemeContext } from "@shared-contexts/ThemeProvider";
import {
  BottomSheetNavScreen,
  BottomSheetWebWithNavV2,
  BottomSheetWithNavV2,
} from "@components/BottomSheetWithNavV2";
import { LoansCarousel } from "@screens/WalletNavigator/screens/components/LoansCarousel";
import { useBottomSheet } from "@hooks/useBottomSheet";
import { LoanCardsV2 } from "./components/LoanCardsV2";
import { VaultsV2 } from "./components/VaultsV2";
import { ButtonGroupV2 } from "../Dex/components/ButtonGroupV2";
import { VaultStatus } from "./VaultStatusTypes";
import { LoanParamList } from "./LoansNavigator";
import { VaultBanner } from "./components/VaultBanner";
import { PriceOracleInfo } from "./components/PriceOracleInfo";
import { BottomSheetModalInfo } from "../../../../components/BottomSheetModalInfo";

enum TabKey {
  Borrow = "BORROW",
  YourVaults = "YOUR_VAULTS",
}

export function LoansScreenV2(): JSX.Element {
  const { address } = useWalletContext();
  const { isLight } = useThemeContext();
  const navigation = useNavigation<NavigationProp<LoanParamList>>();

  const isFocused = useIsFocused();
  const blockCount = useSelector((state: RootState) => state.block.count);
  const { vaults, hasFetchedLoansData } = useSelector(
    (state: RootState) => state.loans
  );

  const loans = useSelector((state: RootState) =>
    loanTokensSelector(state.loans)
  );
  const vaultsList = useSelector((state: RootState) =>
    vaultsSelector(state.loans)
  );

  const [activeTab, setActiveTab] = useState<string>(TabKey.Borrow);
  const dispatch = useAppDispatch();
  const client = useWhaleApiClient();

  const onTabChange = (tabKey: TabKey): void => {
    setActiveTab(tabKey);
  };

  const tabsList = [
    {
      id: TabKey.Borrow,
      label: translate("components/tabs", "Borrow"),
      disabled: false,
      handleOnPress: () => onTabChange(TabKey.Borrow),
    },
    {
      id: TabKey.YourVaults,
      label: translate("components/tabs", "Your vaults"),
      disabled: false,
      handleOnPress: () => onTabChange(TabKey.YourVaults),
    },
  ];

  // Search
  const [filteredLoans, setFilteredLoans] = useState<LoanToken[]>(loans);
  const [isVaultReady, setIsVaultReady] = useState(false);

  const {
    bottomSheetRef,
    containerRef,
    dismissModal,
    expandModal,
    isModalDisplayed,
  } = useBottomSheet();
  const [bottomSheetScreen, setBottomSheetScreen] = useState<
    BottomSheetNavScreen[]
  >([]);
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
          style={tailwind("mr-5 mt-4 -mb-4")}
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
    "Oracles provide real time price data points from trusted sources, to reflect onto DeFiChain.";

  const onBottomSheetOraclePriceSelect = (): void => {
    setBottomSheetScreen([
      {
        stackScreenName: "OraclePriceInfo",
        component: BottomSheetModalInfo({ title, description }),
        option: BottomSheetHeader,
      },
    ]);
    expandModal();
  };
  const onBottomSheetLoansInfoSelect = (): void => {
    function LoansCarouselComponent() {
      return <LoansCarousel dismissModal={dismissModal} />;
    }
    setBottomSheetScreen([
      {
        stackScreenName: "LoansCarousel",
        component: LoansCarouselComponent,
        option: BottomSheetHeader,
      },
    ]);
    expandModal();
  };

  const goToCreateVault = (): void => {
    navigation.navigate({
      name: "CreateVaultScreen",
      params: {},
      merge: true,
    });
  };

  useEffect(() => {
    setFilteredLoans(loans);
  }, [hasFetchedLoansData]);

  useEffect(() => {
    if (isFocused) {
      batch(() => {
        dispatch(fetchVaults({ address, client }));
        dispatch(fetchLoanTokens({ client }));
      });
    }
  }, [blockCount, address, isFocused]);

  useEffect(() => {
    dispatch(fetchLoanSchemes({ client }));
  }, []);

  useEffect(() => {
    setIsVaultReady(
      vaultsList.some((vault) => vault.vaultState !== VaultStatus.Empty)
    );
  }, [vaultsList]);

  return (
    <ThemedViewV2 style={tailwind("flex-1")}>
      <ThemedViewV2
        light={tailwind("bg-mono-light-v2-00 border-mono-light-v2-100")}
        dark={tailwind("bg-mono-dark-v2-00 border-mono-dark-v2-100")}
        style={tailwind(
          "flex flex-col items-center pt-4 rounded-b-2xl border-b"
        )}
        testID="loans_screen"
      >
        <View style={tailwind("w-full px-5")}>
          <ButtonGroupV2
            buttons={tabsList}
            activeButtonGroupItem={activeTab}
            testID="loans_tabs"
            lightThemeStyle={tailwind("bg-transparent")}
            darkThemeStyle={tailwind("bg-transparent")}
          />
        </View>
      </ThemedViewV2>

      {activeTab === TabKey.YourVaults && <VaultsV2 />}
      {activeTab === TabKey.Borrow && !hasFetchedLoansData && (
        <View style={tailwind("mt-1")}>
          <SkeletonLoader row={6} screen={SkeletonLoaderScreen.LoanV2} />
        </View>
      )}
      <ThemedScrollViewV2>
        {activeTab === TabKey.Borrow && hasFetchedLoansData && (
          <>
            {vaults.length === 0 && (
              <View style={tailwind("mx-5 mt-8 rounded-lg-v2")}>
                <VaultBanner
                  buttonLabel="Create a vault"
                  description="You need a vault with collaterals to borrow tokens"
                  onButtonPress={goToCreateVault} // TODO @chloe: button press not working on mobile
                />
                <View style={tailwind("mt-2")}>
                  <PriceOracleInfo onPress={onBottomSheetOraclePriceSelect} />
                </View>
              </View>
            )}
            {/* adding padding here will cause error FlashList's rendered size is not usable. */}
            <LoanCardsV2
              testID="loans_cards"
              loans={filteredLoans}
              vaultExist={isVaultReady}
            />
          </>
        )}
      </ThemedScrollViewV2>
      {Platform.OS === "web" && (
        <BottomSheetWebWithNavV2
          modalRef={containerRef}
          screenList={bottomSheetScreen}
          isModalDisplayed={isModalDisplayed}
          // eslint-disable-next-line react-native/no-inline-styles
          modalStyle={{
            position: "absolute",
            bottom: "0",
            height: "474px",
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
          snapPoints={{
            ios: ["30%"],
            android: ["35%"],
          }}
        />
      )}
    </ThemedViewV2>
  );
}
