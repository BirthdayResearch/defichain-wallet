import { LoanVault } from "@store/loans";
import { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { tailwind } from "@tailwind";
import {
  BottomSheetWebWithNav,
  BottomSheetWithNav,
} from "@components/BottomSheetWithNav";
import { translate } from "@translations";
import {
  BottomSheetInfoV2,
  BottomSheetAlertInfoV2,
} from "@components/BottomSheetInfoV2";
import { LoanVaultState } from "@defichain/whale-api-client/dist/api/loan";
import { useBottomSheet } from "@hooks/useBottomSheet";
import { ThemedTextV2 } from "@components/themed";
import { LoansRow } from "./VaultDetailLoansRow";
import { CollateralsRow } from "./VaultDetailCollateralsRow";

interface VaultDetailTabSectionProps {
  vault: LoanVault;
}

export function VaultDetailTokensSection({
  vault,
}: VaultDetailTabSectionProps): JSX.Element {
  const [isDusdLoaned, setIsDusdLoaned] = useState<boolean>(false);
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
  }, []);

  return (
    <View ref={containerRef}>
      <CollateralsRow vault={vault} />
      <InfoText
        firstText={translate(
          "screens/VaultDetailScreenCollateralSection",
          isDusdLoaned
            ? "Maintain at least 50% DFI as collateral for DUSD"
            : "Your loan amount can be maximized by adding"
        )}
        secondText={translate(
          "screens/VaultDetailScreenCollateralSection",
          isDusdLoaned ? "loans" : "DFI/DUSD as collaterals"
        )}
        info={{
          title: translate(
            "screens/VaultDetailScreenCollateralSection",
            isDusdLoaned ? "Why you need 50% DFI" : "Max loan amount"
          ),
          message: translate(
            "screens/VaultDetailScreenCollateralSection",
            isDusdLoaned
              ? "DUSD loans which contains DUSD as collateral are required to maintain at least 50% of the collateral in the form of DFI. \n\n This only affects vaults that has DUSD as both collateral and loan."
              : "This is the current loan amount available for this vault."
          ),
        }}
      />
      <LoansRow
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

// Some re render issue here why yet
function InfoText({
  firstText,
  secondText,
  info,
}: {
  firstText: string;
  secondText: string;
  info: BottomSheetAlertInfoV2;
}): JSX.Element {
  return (
    <View style={tailwind("mx-10")}>
      <ThemedTextV2
        light={tailwind("text-mono-light-v2-500")}
        dark={tailwind("text-mono-dark-v2-500")}
        style={tailwind("text-xs font-normal-v2")}
      >
        {firstText}
      </ThemedTextV2>
      <View style={tailwind("flex flex-row")}>
        <ThemedTextV2
          light={tailwind("text-mono-light-v2-500")}
          dark={tailwind("text-mono-dark-v2-500")}
          style={tailwind("text-xs font-normal-v2 mr-1")}
        >
          {secondText}
        </ThemedTextV2>
        <BottomSheetInfoV2
          alertInfo={info}
          name="info-text"
          infoIconStyle={tailwind("text-sm")}
          snapPoints={["40%"]}
        />
      </View>
    </View>
  );
}
