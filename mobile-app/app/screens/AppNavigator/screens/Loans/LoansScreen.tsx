import { useEffect, useRef, useState } from "react";
import { batch, useSelector } from "react-redux";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { RootState } from "@store";
import { fetchLoanSchemes, fetchLoanTokens, fetchVaults } from "@store/loans";
import { useWhaleApiClient } from "@shared-contexts/WhaleContext";
import { useWalletContext } from "@shared-contexts/WalletContext";
import { useIsFocused, useScrollToTop } from "@react-navigation/native";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { ThemedViewV2 } from "@components/themed";
import { View } from "react-native";
import { useBottomSheet } from "@hooks/useBottomSheet";
import { LoanCards } from "./components/LoanCards";
import { Vaults } from "./components/Vaults";
import { ButtonGroup } from "../Dex/components/ButtonGroup";

enum TabKey {
  Borrow = "BORROW",
  YourVaults = "YOUR_VAULTS",
}

export function LoansScreen(): JSX.Element {
  const { address } = useWalletContext();
  const isFocused = useIsFocused();
  const blockCount = useSelector((state: RootState) => state.block.count);
  const dispatch = useAppDispatch();
  const client = useWhaleApiClient();

  const [activeTab, setActiveTab] = useState<string>(TabKey.Borrow);

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

  /* useScrollToTop will not function in nested screens component, that's why we are passing the scroll view reference into LoadCards and Vaults component */
  const borrowScrollRef = useRef(null);
  const vaultScrollRef = useRef(null);
  useScrollToTop(borrowScrollRef);
  useScrollToTop(vaultScrollRef);

  const { containerRef } = useBottomSheet();

  useEffect(() => {
    if (isFocused) {
      batch(() => {
        dispatch(
          fetchVaults({
            address,
            client,
          })
        );
        dispatch(fetchLoanTokens({ client }));
      });
    }
  }, [blockCount, address, isFocused]);

  useEffect(() => {
    dispatch(fetchLoanSchemes({ client }));
  }, []);

  return (
    <View ref={containerRef} style={tailwind("flex-1")}>
      <ThemedViewV2 testID="loans_screen" style={tailwind("flex-1")}>
        <ThemedViewV2
          light={tailwind("bg-mono-light-v2-00 border-mono-light-v2-100")}
          dark={tailwind("bg-mono-dark-v2-00 border-mono-dark-v2-100")}
          style={tailwind(
            "flex flex-col items-center pt-4 rounded-b-2xl border-b z-20"
          )}
        >
          <View style={tailwind("w-full px-5")}>
            <ButtonGroup
              buttons={tabsList}
              activeButtonGroupItem={activeTab}
              testID="loans_tabs"
              lightThemeStyle={tailwind("bg-transparent")}
              darkThemeStyle={tailwind("bg-transparent")}
            />
          </View>
        </ThemedViewV2>
        <View
          style={tailwind("flex-1", {
            hidden: activeTab !== TabKey.YourVaults,
          })}
        >
          <Vaults scrollRef={vaultScrollRef} />
        </View>
        <View
          style={tailwind("flex-1 flex-grow", {
            hidden: activeTab !== TabKey.Borrow,
          })}
        >
          <LoanCards
            sortRef={containerRef}
            scrollRef={borrowScrollRef}
            testID="loan_screen"
          />
        </View>
      </ThemedViewV2>
    </View>
  );
}
