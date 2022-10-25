import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import { ThemedIcon, ThemedTextV2, ThemedViewV2 } from "@components/themed";
import { tailwind } from "@tailwind";
import { View } from "@components";
import { SymbolIcon } from "@components/SymbolIcon";
import { NumericFormat as NumberFormat } from "react-number-format";
import { LoanVault } from "@store/loans";
import {
  CollateralToken,
  LoanVaultState,
} from "@defichain/whale-api-client/dist/api/loan";
import { translate } from "@translations";
import { ActiveUSDValueV2 } from "@screens/AppNavigator/screens/Loans/VaultDetail/components/ActiveUSDValueV2";
import { LoanAddRemoveActionButton } from "@screens/AppNavigator/screens/Loans/components/LoanActionButton";
import {
  BottomSheetAlertInfoV2,
  BottomSheetInfoV2,
} from "@components/BottomSheetInfoV2";
import { CollateralFactorTag } from "@components/CollateralFactorTag";
import { CollateralItem } from "@screens/AppNavigator/screens/Loans/screens/EditCollateralScreen";
import { VaultStatus } from "@screens/AppNavigator/screens/Loans/VaultStatusTypes";
import { getCollateralPrice } from "../../hooks/CollateralPrice";

interface CollateralCardProps {
  displaySymbol: string;
  amount: BigNumber;
  collateralItem: CollateralToken;
  totalCollateralValue: BigNumber;
  onAddCollateralPress: () => void;
  onRemoveCollateralPress: () => void;
  vaultStatus?: string;
}

export function VaultDetailCollateralsRow({
  vault,
  collateralTokens,
  vaultStatus,
  onAddPress,
  onRemovePress,
}: {
  vault: LoanVault;
  collateralTokens: CollateralItem[];
  vaultStatus?: string;
  onAddPress: (collateralItem: CollateralItem) => void;
  onRemovePress: (collateralItem: CollateralItem) => void;
}): JSX.Element {
  const [hideDFIStaticCard, setHideDFIStaticCard] = useState<boolean>(false);
  const [isAffectedVault, setIsAffectedVault] = useState<boolean>(false); // Affected Vault means having DUSD in both collaterals and loans

  useEffect(() => {
    if (vault.state !== LoanVaultState.IN_LIQUIDATION) {
      setHideDFIStaticCard(
        vault.collateralAmounts.some((col) => col.displaySymbol === "DFI")
      );

      setIsAffectedVault(
        vault.collateralAmounts.some((col) => col.displaySymbol === "DUSD") &&
          vault.loanAmounts.some((loan) => loan.displaySymbol === "DUSD")
      );
    }
  }, [vault]);

  return (
    <View style={tailwind("mx-5 mt-6")}>
      <ThemedTextV2
        light={tailwind("text-mono-light-v2-500")}
        dark={tailwind("text-mono-dark-v2-500")}
        style={tailwind("text-xs font-normal-v2 mb-2 px-5")}
      >
        {translate("screens/VaultDetailScreenCollateralSection", "COLLATERALS")}
      </ThemedTextV2>
      {vault.state === LoanVaultState.IN_LIQUIDATION &&
        vault.batches.length > 0 &&
        vault.batches[0].collaterals.map((collateral) => {
          return (
            <LiquidatedVaultCollateralCard
              key={collateral.id}
              displaySymbol={collateral.displaySymbol}
            />
          );
        })}

      {!hideDFIStaticCard && (
        <CollateralCardDfi
          onDFIAdd={() => {
            const collateralItem = collateralTokens.find(
              (col) => col.token.displaySymbol === "DFI"
            );
            if (collateralItem !== undefined) {
              onAddPress(collateralItem);
            }
          }}
        />
      )}

      {vault.state !== LoanVaultState.IN_LIQUIDATION &&
        vault.collateralAmounts.map((collateral, index) => {
          const collateralItem = collateralTokens.find(
            (col) => col.token.id === collateral.id
          );

          if (collateralItem !== undefined) {
            return (
              <CollateralCard
                key={collateral.id}
                collateralItem={collateralItem}
                totalCollateralValue={new BigNumber(vault.collateralValue)}
                displaySymbol={collateral.displaySymbol}
                amount={new BigNumber(collateral.amount)}
                onAddCollateralPress={() => onAddPress(collateralItem)}
                onRemoveCollateralPress={() => onRemovePress(collateralItem)}
                vaultStatus={vaultStatus}
              />
            );
          } else {
            // TODO Add Skeleton Loader
            return <View key={index} />;
          }
        })}

      <InfoText
        displayText={translate(
          "screens/VaultDetailScreenCollateralSection",
          isAffectedVault
            ? "Maintain at least 50% DFI as collateral for DUSD loans"
            : "Your loan amount can be maximized by adding DFI/DUSD as collaterals"
        )}
        info={{
          title: translate(
            "screens/VaultDetailScreenCollateralSection",
            isAffectedVault ? "Why you need 50% DFI" : "DFI/DUSD collaterals"
          ),
          message: translate(
            "screens/VaultDetailScreenCollateralSection",
            isAffectedVault
              ? "DUSD loans which contains DUSD as collateral are required to maintain at least 50% of the collateral in the form of DFI.\n\nThis only affects vaults that has DUSD as both collateral and loan."
              : "Adding in DFI and/or DUSD will boost your borrowing power and help maximize your vault's loan amount."
          ),
        }}
        isAffectedVault={isAffectedVault}
      />
    </View>
  );
}

function LiquidatedVaultCollateralCard({
  displaySymbol,
}: {
  displaySymbol: string;
}): JSX.Element {
  return (
    <ThemedViewV2
      light={tailwind("bg-mono-light-v2-00")}
      dark={tailwind("bg-mono-dark-v2-00")}
      style={tailwind("p-4 mb-2 rounded-lg-v2")}
    >
      <View style={tailwind("flex flex-row justify-between items-center")}>
        <View style={tailwind("flex flex-row items-center")}>
          <SymbolIcon symbol={displaySymbol} styleHeight={36} styleWidth={36} />
          <ThemedTextV2
            light={tailwind("text-gray-300")}
            dark={tailwind("text-gray-600")}
            style={tailwind("ml-2 font-medium")}
          >
            {displaySymbol}
          </ThemedTextV2>
        </View>
      </View>
    </ThemedViewV2>
  );
}

function CollateralCardDfi({
  onDFIAdd,
}: {
  onDFIAdd: () => void;
}): JSX.Element {
  return (
    <ThemedViewV2
      light={tailwind("bg-mono-light-v2-00")}
      dark={tailwind("bg-mono-dark-v2-00")}
      style={tailwind("py-4 px-5 mb-2 rounded-lg-v2")}
      testID="collateral_card_dfi_empty"
    >
      <View style={tailwind("flex flex-row justify-between items-center")}>
        <View style={tailwind("flex flex-row items-center")}>
          <SymbolIcon symbol="DFI" styleWidth={36} styleHeight={36} />
          <View style={tailwind("ml-2")}>
            <ThemedTextV2
              dark={tailwind("text-mono-dark-v2-900")}
              light={tailwind("text-mono-light-v2-900")}
              style={tailwind("text-sm font-semibold-v2")}
              // eslint-disable-next-line react-native/no-raw-text
            >
              0.00
            </ThemedTextV2>
            <ThemedTextV2
              dark={tailwind("text-mono-dark-v2-700")}
              light={tailwind("text-mono-light-v2-700")}
              style={tailwind("text-xs font-normal-v2")}
              // eslint-disable-next-line react-native/no-raw-text
            >
              $ 0.00
            </ThemedTextV2>
          </View>
        </View>

        <LoanAddRemoveActionButton onAdd={onDFIAdd} leftDisabled token="DFI" />
      </View>
    </ThemedViewV2>
  );
}

function CollateralCard(props: CollateralCardProps): JSX.Element {
  const prices = getCollateralPrice(
    props.amount,
    props.collateralItem,
    props.totalCollateralValue
  );

  return (
    <ThemedViewV2
      light={tailwind("bg-mono-light-v2-00")}
      dark={tailwind("bg-mono-dark-v2-00")}
      style={tailwind("py-4 px-5 mb-2 rounded-lg-v2")}
      testID={`vault_detail_collateral_${props.displaySymbol}`}
    >
      <View style={tailwind("flex flex-row justify-between items-center")}>
        <View style={tailwind("flex flex-row items-center")}>
          <SymbolIcon
            symbol={props.displaySymbol}
            styleWidth={36}
            styleHeight={36}
          />

          <View style={tailwind("ml-2")}>
            <View style={tailwind("flex flex-row items-center")}>
              <NumberFormat
                value={props.amount?.toFixed(8)}
                thousandSeparator
                decimalScale={8}
                displayType="text"
                renderText={(val: string) => (
                  <ThemedTextV2
                    dark={tailwind("text-mono-dark-v2-900")}
                    light={tailwind("text-mono-light-v2-900")}
                    style={tailwind("text-sm font-semibold-v2")}
                    testID={`vault_detail_collateral_${props.displaySymbol}_amount`}
                  >
                    {val}
                  </ThemedTextV2>
                )}
              />
              <CollateralFactorTag
                factor={props.collateralItem.factor}
                containerStyle={tailwind(
                  "h-5 flex flex-row items-center rounded px-2 py-1 ml-1 border-0.5"
                )}
                textStyle={tailwind("font-semibold-v2 text-2xs leading-3")}
              />
            </View>

            <View style={tailwind("flex flex-row")}>
              <ActiveUSDValueV2
                price={new BigNumber(props.amount).multipliedBy(
                  prices.activePrice
                )}
              />
              <NumberFormat
                value={prices.vaultShare?.toFixed(2)}
                thousandSeparator
                decimalScale={2}
                displayType="text"
                suffix="%"
                renderText={(val: string) => (
                  <ThemedTextV2
                    dark={tailwind("text-mono-dark-v2-700", {
                      "text-red-v2":
                        props.displaySymbol === "DFI" &&
                        new BigNumber(prices.vaultShare).lt(new BigNumber(50)),
                    })}
                    light={tailwind("text-mono-light-v2-700", {
                      "text-red-v2":
                        props.displaySymbol === "DFI" &&
                        new BigNumber(prices.vaultShare).lt(new BigNumber(50)),
                    })}
                    style={tailwind("text-xs font-normal-v2")}
                    testID={`vault_detail_collateral_${props.displaySymbol}_vault_share`}
                  >
                    {` (${val})`}
                  </ThemedTextV2>
                )}
              />
            </View>
          </View>
        </View>

        <LoanAddRemoveActionButton
          onAdd={props.onAddCollateralPress}
          onRemove={props.onRemoveCollateralPress}
          token={props.displaySymbol}
          leftDisabled={props.vaultStatus === VaultStatus.Halted}
        />
      </View>
    </ThemedViewV2>
  );
}

function InfoText({
  displayText,
  info,
  isAffectedVault,
}: {
  displayText: string;
  info: BottomSheetAlertInfoV2;
  isAffectedVault: boolean;
}): JSX.Element {
  return (
    <View style={tailwind("flex-row mx-5 items-center")}>
      <ThemedTextV2
        light={tailwind("text-mono-light-v2-500")}
        dark={tailwind("text-mono-dark-v2-500")}
        style={tailwind("flex-1 flex-wrap text-xs font-normal-v2 pr-1")}
      >
        {displayText}
      </ThemedTextV2>
      <BottomSheetInfoV2
        alertInfo={info}
        name="info-text"
        infoIconStyle={tailwind("text-sm")}
        snapPoints={isAffectedVault ? ["50%"] : ["40%"]}
        triggerComponent={
          <ThemedIcon
            size={16}
            name="info-outline"
            iconType="MaterialIcons"
            dark={tailwind("text-mono-dark-v2-500")}
            light={tailwind("text-mono-light-v2-500")}
          />
        }
      />
    </View>
  );
}
