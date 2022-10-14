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
import { ThemedTextV2 } from "@components/themed";
import { useBottomSheet } from "@hooks/useBottomSheet";
import {
  BottomSheetAlertInfoV2,
  BottomSheetInfoV2,
} from "@components/BottomSheetInfoV2";
import { LoansTabV2 } from "./LoansTabV2";
import { CollateralsTabV2 } from "./CollateralsTabV2";

interface VaultDetailTabSectionProps {
  vault: LoanVault;
}

export function VaultDetailTabSectionV2({
  vault,
}: VaultDetailTabSectionProps): JSX.Element {
  const [isDusdLoaned, setIsDusdLoaned] = useState(false);
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
    if (vault.state !== LoanVaultState.IN_LIQUIDATION) {
      setIsDusdLoaned(
        vault.loanAmounts.some((loan) => loan.displaySymbol === "DUSD")
      );
    }
  }, [vault]);

  return (
    <View ref={containerRef}>
      <CollateralsTabV2 vault={vault} />
      <InfoText
        dusdCollateral={isDusdLoaned}
        info={{
          title: translate(
            "screens/VaultDetailScreen",
            isDusdLoaned ? "Why you need 50% DFI" : "Max loan amount"
          ),
          message: translate(
            "screens/VaultDetailScreen",
            isDusdLoaned
              ? "DUSD loans which contains DUSD as collateral are required to maintain at least 50% of the collateral in the form of DFI. \n\n This only affects vaults that has DUSD as both collateral and loan."
              : "This is the current loan amount available for this vault."
          ),
        }}
      />

      <LoansTabV2
        dismissModal={dismissModal}
        expandModal={expandModal}
        setBottomSheetScreen={setBottomSheetScreen}
        vault={vault}
      />
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

function InfoText({
  dusdCollateral,
  info,
}: {
  dusdCollateral: boolean;
  info: BottomSheetAlertInfoV2;
}): JSX.Element {
  return (
    <View style={tailwind("mx-10")}>
      <ThemedTextV2
        light={tailwind("text-mono-light-v2-500")}
        dark={tailwind("text-mono-dark-v2-500")}
        style={tailwind("text-xs font-normal-v2")}
      >
        {translate(
          "screens/Loans",
          dusdCollateral
            ? "Maintain at least 50% DFI as collateral for DUSD"
            : "Your loan amount can be maximized by adding"
        )}
      </ThemedTextV2>
      <View style={tailwind("flex flex-row")}>
        <ThemedTextV2
          light={tailwind("text-mono-light-v2-500")}
          dark={tailwind("text-mono-dark-v2-500")}
          style={tailwind("text-xs font-normal-v2 mr-1")}
        >
          {translate(
            "screens/Loans",
            dusdCollateral ? "loans" : "DFI/DUSD as collaterals"
          )}
        </ThemedTextV2>
        <BottomSheetInfoV2
          alertInfo={info}
          name={info.title}
          infoIconStyle={tailwind("text-sm")}
          snapPoints={["40%"]}
        />
      </View>
    </View>
  );
}
