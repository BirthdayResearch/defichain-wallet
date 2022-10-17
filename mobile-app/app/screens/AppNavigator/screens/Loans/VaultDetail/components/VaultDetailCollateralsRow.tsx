import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import { ThemedTextV2, ThemedViewV2 } from "@components/themed";
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
import { useSelector } from "react-redux";
import { RootState } from "@store";
import { ActiveUSDValueV2 } from "@screens/AppNavigator/screens/Loans/VaultDetail/components/ActiveUSDValueV2";
import { LoanAddRemoveActionButton } from "@screens/AppNavigator/screens/Loans/components/LoanActionButton";
import {
  BottomSheetAlertInfoV2,
  BottomSheetInfoV2,
} from "@components/BottomSheetInfoV2";
import { getCollateralPrice } from "../../hooks/CollateralPrice";

interface CollateralCardProps {
  displaySymbol: string;
  amount: BigNumber;
  collateralItem: CollateralToken;
  totalCollateralValue: BigNumber;
  onAddCollateralPress: () => void;
  onRemoveCollateralPress: () => void;
}

export function VaultDetailCollateralsRow({
  vault,
  onAddPress,
  onRemovePress,
}: {
  vault: LoanVault;
  onAddPress: () => void;
  onRemovePress: () => void;
}): JSX.Element {
  const [hideDFIStaticCard, setHideDFIStaticCard] = useState<boolean>(false);
  const [isDusdLoaned, setIsDusdLoaned] = useState<boolean>(false);
  const collateralTokens = useSelector(
    (state: RootState) => state.loans.collateralTokens
  );

  useEffect(() => {
    if (vault.state !== LoanVaultState.IN_LIQUIDATION) {
      setHideDFIStaticCard(
        vault.collateralAmounts.some((col) => col.displaySymbol === "DFI")
      );
    }
  }, []);

  useEffect(() => {
    if (vault.state !== LoanVaultState.IN_LIQUIDATION) {
      setIsDusdLoaned(
        vault.loanAmounts.some((loan) => loan.displaySymbol === "DUSD")
      );
    }
  }, []);

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

      {!hideDFIStaticCard && <CollateralCardDfi onDFIAdd={onAddPress} />}

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
                onAddCollateralPress={onAddPress}
                onRemoveCollateralPress={onRemovePress}
              />
            );
          } else {
            // TODO Add Skeleton Loader
            return <View key={index} />;
          }
        })}

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
              ? "DUSD loans which contains DUSD as collateral are required to maintain at least 50% of the collateral in the form of DFI.\n\nThis only affects vaults that has DUSD as both collateral and loan."
              : "This is the current loan amount available for this vault."
          ),
        }}
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
      light={tailwind("bg-white border-gray-200")}
      dark={tailwind("bg-gray-800 border-gray-700")}
      style={tailwind("p-4 mb-2 border rounded")}
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

  const dusdCollateralFactor = new BigNumber(
    props.collateralItem.factor ?? 0
  ).times(1);

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
              {props.collateralItem.token.displaySymbol === "DUSD" && (
                <ThemedViewV2
                  dark={tailwind("border-mono-dark-v2-700")}
                  light={tailwind("border-mono-light-v2-700")}
                  style={[
                    tailwind("border-0.5 px-2 ml-1"),
                    { borderRadius: 5 },
                  ]}
                >
                  <NumberFormat
                    value={dusdCollateralFactor.toFixed()}
                    thousandSeparator
                    decimalScale={2}
                    displayType="text"
                    suffix="x"
                    renderText={(val: string) => (
                      <ThemedTextV2
                        dark={tailwind("text-mono-dark-v2-700")}
                        light={tailwind("text-mono-light-v2-700")}
                        style={[tailwind("font-semibold-v2"), { fontSize: 10 }]}
                        testID={`vault_detail_collateral_${props.displaySymbol}_vault_share`}
                      >
                        {val}
                      </ThemedTextV2>
                    )}
                  />
                </ThemedViewV2>
              )}
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
        />
      </View>
    </ThemedViewV2>
  );
}

// Some re render and logic issue here. dunno why yet
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
    <View style={tailwind("mx-5")}>
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
