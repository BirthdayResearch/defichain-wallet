import { Tabs } from "@components/Tabs";
import { LoanVaultState } from "@defichain/whale-api-client/dist/api/loan";
import { LoanVault } from "@store/loans";
import { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { translate } from "@translations";
import { tailwind } from "@tailwind";
import {
  BottomSheetWebWithNav,
  BottomSheetWithNav,
} from "@components/BottomSheetWithNav";
import { ThemedTextV2, ThemedViewV2, ThemedIcon } from "@components/themed";
import { useBottomSheet } from "@hooks/useBottomSheet";
import { LoansTabV2 } from "./LoansTabV2";
import { CollateralsTabV2 } from "./CollateralsTabV2";
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

export function VaultDetailTabSectionV2({
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

  return (
    <View ref={containerRef}>
      <CollateralsTabV2 vault={vault} />

      <LoansTabV2
        dismissModal={dismissModal}
        expandModal={expandModal}
        setBottomSheetScreen={setBottomSheetScreen}
        vault={vault}
      />
      {/* <ThemedView>
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
      </ThemedView> */}
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
