import { useEffect, useRef, useState } from "react";
import { batch, useSelector } from "react-redux";
import { tailwind } from "@tailwind";
import { RootState } from "@store";
import { fetchLoanSchemes, fetchLoanTokens, fetchVaults } from "@store/loans";
import { useWhaleApiClient } from "@shared-contexts/WhaleContext";
import { useWalletContext } from "@shared-contexts/WalletContext";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { useIsFocused, useScrollToTop } from "@react-navigation/native";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { ThemedViewV2 } from "@components/themed";
import { Tabs } from "@components/Tabs";
import { LoanCardsV2 } from "./components/LoanCardsV2";
import { VaultsV2 } from "./components/VaultsV2";

/* Commented temporarily to debug the internal build issue */
// const LoansTab = createMaterialTopTabNavigator();

enum TabKey {
  Borrow = "BORROW",
  YourVaults = "YOUR_VAULTS",
}

export function LoansScreenV2(): JSX.Element {
  const { isLight } = useThemeContext();
  const { address } = useWalletContext();
  const isFocused = useIsFocused();
  const blockCount = useSelector((state: RootState) => state.block.count);
  const dispatch = useAppDispatch();
  const client = useWhaleApiClient();

  const [activeTab, setActiveTab] = useState<string>(TabKey.YourVaults);
  const onPress = (tabId: string): void => {
    setActiveTab(tabId);
  };
  const tabsList = [
    {
      id: TabKey.Borrow,
      label: "Browse loan tokens",
      disabled: false,
      handleOnPress: onPress,
    },
    {
      id: TabKey.YourVaults,
      label: "Your vaults",
      disabled: false,
      handleOnPress: onPress,
    },
  ];

  /* useScrollToTop will not function in nested screens component, that's why we are passing the scroll view reference into LoadCards and Vaults component */
  const borrowScrollRef = useRef(null);
  const vaultScrollRef = useRef(null);
  useScrollToTop(borrowScrollRef);
  useScrollToTop(vaultScrollRef);

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
    /* Commented temporarily to debug the internal build issue */
    <ThemedViewV2 testID="loans_screen" style={tailwind("flex-1")}>
      <Tabs
        tabSections={tabsList}
        testID="loans_tabs"
        activeTabKey={activeTab}
      />
      {activeTab === TabKey.YourVaults && (
        <VaultsV2 scrollRef={vaultScrollRef} />
      )}
      {activeTab === TabKey.Borrow && (
        <LoanCardsV2 scrollRef={borrowScrollRef} testID="loan_screen" />
      )}
    </ThemedViewV2>

    // <LoansTab.Navigator
    //   screenOptions={{
    //     swipeEnabled: false,
    //     tabBarLabelStyle: [
    //       tailwind("font-semibold-v2 text-sm text-center", {
    //         "text-mono-light-v2-900": isLight,
    //         "text-mono-dark-v2-900": !isLight,
    //       }),
    //       {
    //         textTransform: "none",
    //       },
    //     ],
    //     tabBarActiveTintColor: getColor("brand-v2-500"),
    //     tabBarPressColor: "transparent",
    //     tabBarIndicatorStyle: {
    //       borderBottomWidth: 2,
    //       borderColor: getColor("brand-v2-500"),
    //       width: "40%",
    //       left: "5%",
    //     },
    //     tabBarInactiveTintColor: getColor(
    //       isLight ? "mono-light-v2-900" : "mono-dark-v2-900"
    //     ),
    //     tabBarStyle: [
    //       {
    //         borderBottomLeftRadius: 12,
    //         borderBottomRightRadius: 12,
    //         overflow: "hidden",
    //       },
    //       tailwind({
    //         "bg-mono-light-v2-00": isLight,
    //         "bg-mono-dark-v2-00": !isLight,
    //       }),
    //     ],
    //   }}
    // >
    //   <LoansTab.Screen
    //     name={TabKey.Borrow}
    //     options={{
    //       tabBarLabel: (props) => (
    //         <Text
    //           style={[
    //             tailwind("font-semibold-v2 text-sm text-center"),
    //             { color: props.color },
    //           ]}
    //         >
    //           {translate("components/tabs", "Borrow")}
    //         </Text>
    //       ),
    //       tabBarTestID: `loans_tabs_${TabKey.Borrow}`,
    //     }}
    //   >
    //     {() => <LoanCardsV2 scrollRef={borrowScrollRef} testID="loan_screen" />}
    //   </LoansTab.Screen>
    //   <LoansTab.Screen
    //     name={TabKey.YourVaults}
    //     options={{
    //       tabBarLabel: (props) => (
    //         <Text
    //           style={[
    //             tailwind("font-semibold-v2 text-sm text-center"),
    //             { color: props.color },
    //           ]}
    //         >
    //           {translate("components/tabs", "Your vaults")}
    //         </Text>
    //       ),
    //       tabBarTestID: `loans_tabs_${TabKey.YourVaults}`,
    //     }}
    //   >
    //     {() => <VaultsV2 scrollRef={vaultScrollRef} />}
    //   </LoansTab.Screen>
    // </LoansTab.Navigator>
  );
}
