import { Tabs } from "@components/Tabs";
import { ThemedView } from "@components/themed";
import { LoanVaultState } from "@defichain/whale-api-client/dist/api/loan";
import { LoanVault } from "@store/loans";
import { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import {
  BottomSheetWebWithNav,
  BottomSheetWithNav,
} from "@components/BottomSheetWithNav";
import { useBottomSheet } from "@hooks/useBottomSheet";
import { LoansTab } from "./LoansTab";
import { CollateralsTab } from "./CollateralsTab";
import { DetailsTab } from "./DetailsTab";

export enum TabKey {
  Loans = "LOANS",
  Details = "DETAILS",
  Collaterals = "COLLATERAL",
  Auctions = "AUCTIONS",
}

interface VaultDetailTabSectionProps {
  vault: LoanVault;
  tab?: TabKey;
}

interface VaultDetailTabsProps {
  id: TabKey;
  label: string;
  disabled: boolean;
  handleOnPress: (tabId: string) => void;
}

export function VaultDetailTabSection({
  vault,
  tab,
}: VaultDetailTabSectionProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<string>(tab ?? TabKey.Collaterals);
  const [detailTabs, setDetailTabs] = useState<VaultDetailTabsProps[]>([]);
  const onPress = (tabId: string): void => {
    setActiveTab(tabId);
  };
  const {
    bottomSheetRef,
    containerRef,
    isModalDisplayed,
    bottomSheetScreen,
    dismissModal,
    expandModal,
    setBottomSheetScreen,
  } = useBottomSheet();

  useEffect(() => {
    setDetailTabs(getDetailTabs(vault, onPress));
  }, [vault]);

  return (
    <View ref={containerRef}>
      <Tabs
        tabSections={detailTabs}
        activeTabKey={activeTab}
        testID="vault_detail_tabs"
      />
      <ThemedView>
        {activeTab === TabKey.Collaterals && <CollateralsTab vault={vault} />}
        {activeTab === TabKey.Loans && (
          <LoansTab
            dismissModal={dismissModal}
            expandModal={expandModal}
            setBottomSheetScreen={setBottomSheetScreen}
            vault={vault}
          />
        )}
        {activeTab === TabKey.Details &&
          vault.state !== LoanVaultState.IN_LIQUIDATION && (
            <DetailsTab vault={vault} />
          )}
      </ThemedView>
      {Platform.OS === "web" ? (
        <BottomSheetWebWithNav
          modalRef={containerRef}
          screenList={bottomSheetScreen}
          isModalDisplayed={isModalDisplayed}
          // eslint-disable-next-line react-native/no-inline-styles
          modalStyle={{
            position: "absolute",
            height: "240px",
            width: "375px",
            zIndex: 50,
            bottom: 0,
          }}
        />
      ) : (
        <BottomSheetWithNav
          modalRef={bottomSheetRef}
          screenList={bottomSheetScreen}
          snapPoints={{
            ios: ["40%"],
            android: ["40%"],
          }}
        />
      )}
    </View>
  );
}

function getDetailTabs(
  vault: LoanVault,
  tabOnPress: (tabId: string) => void
): VaultDetailTabsProps[] {
  let tabs: VaultDetailTabsProps[] = [];

  if (vault.state === LoanVaultState.IN_LIQUIDATION) {
    tabs = [
      // TODO: add auction tab
      {
        id: TabKey.Collaterals,
        label: "Collateral",
        disabled: false,
        handleOnPress: tabOnPress,
      },
      {
        id: TabKey.Loans,
        label: "Loans",
        disabled: false,
        handleOnPress: tabOnPress,
      },
    ];
  } else {
    tabs = [
      {
        id: TabKey.Collaterals,
        label: "Collateral",
        disabled: false,
        handleOnPress: tabOnPress,
      },
      {
        id: TabKey.Loans,
        label: "Loans",
        disabled:
          vault.state === LoanVaultState.ACTIVE &&
          vault.collateralValue === "0",
        handleOnPress: tabOnPress,
      },
      {
        id: TabKey.Details,
        label: "Details",
        disabled: false,
        handleOnPress: tabOnPress,
      },
    ];
  }

  return tabs;
}
