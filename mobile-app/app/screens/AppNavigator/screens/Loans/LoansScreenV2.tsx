import { useEffect, useState } from "react";
import { View } from "react-native";
import { tailwind } from "@tailwind";
import { ThemedViewV2 } from "@components/themed";
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
import { useIsFocused } from "@react-navigation/native";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { translate } from "@translations";
import { LoanCardsV2 } from "./components/LoanCardsV2";
import { VaultsV2 } from "./components/VaultsV2";
import { ButtonGroupV2 } from "../Dex/components/ButtonGroupV2";
import { VaultStatus } from "./VaultStatusTypes";

enum TabKey {
  Borrow = "BORROW",
  YourVaults = "YOUR_VAULTS",
}

export function LoansScreenV2(): JSX.Element {
  const { address } = useWalletContext();
  const isFocused = useIsFocused();
  const blockCount = useSelector((state: RootState) => state.block.count);
  const { vaults, hasFetchedVaultsData, hasFetchedLoansData } = useSelector(
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
      {activeTab === TabKey.Borrow && hasFetchedLoansData && (
        <LoanCardsV2
          testID="loans_cards"
          loans={filteredLoans}
          vaultExist={isVaultReady}
        />
      )}
    </ThemedViewV2>
  );
}
