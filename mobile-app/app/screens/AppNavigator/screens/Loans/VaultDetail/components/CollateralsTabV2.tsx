import BigNumber from "bignumber.js";
import { ThemedTextV2, ThemedViewV2 } from "@components/themed";
import { tailwind } from "@tailwind";
import { View } from "@components";
import { SymbolIcon } from "@components/SymbolIcon";
import { translate } from "@translations";
import { NumericFormat as NumberFormat } from "react-number-format";
import { LoanVault } from "@store/loans";
import {
  CollateralToken,
  LoanVaultState,
} from "@defichain/whale-api-client/dist/api/loan";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import { ActiveUSDValueV2 } from "@screens/AppNavigator/screens/Loans/VaultDetail/components/ActiveUSDValueV2";
import { LoanAddRemoveActionButton } from "@screens/AppNavigator/screens/Loans/components/LoanActionButton";
import { getCollateralPrice } from "../../hooks/CollateralPrice";
import { EmptyCollateral } from "./EmptyCollateral";

interface CollateralCardProps {
  displaySymbol: string;
  amount: BigNumber;
  collateralItem: CollateralToken;
  totalCollateralValue: BigNumber;
}

export function CollateralsTabV2({ vault }: { vault: LoanVault }): JSX.Element {
  const collateralTokens = useSelector(
    (state: RootState) => state.loans.collateralTokens
  );

  if (vault.state === LoanVaultState.ACTIVE && vault.collateralValue === "0") {
    return <EmptyCollateral vaultId={vault.vaultId} />;
  }

  return (
    <View style={tailwind("p-4")}>
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
              />
            );
          } else {
            // TODO Add Skeleton Loader
            return <View key={index} />;
          }
        })}
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
          <SymbolIcon
            symbol={displaySymbol}
            styleHeight={36}
            styleWidth={36}
            styleProps={tailwind("w-4 h-4")}
          />
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
      style={tailwind("p-4 mb-2 rounded-lg-v2")}
    >
      <View style={tailwind("flex flex-row justify-between items-center")}>
        <View style={tailwind("flex flex-row items-center")}>
          <SymbolIcon
            symbol={props.displaySymbol}
            styleWidth={36}
            styleHeight={36}
          />

          <View style={tailwind("ml-2")}>
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
                    dark={tailwind("text-mono-dark-v2-700")}
                    light={tailwind("text-mono-light-v2-700")}
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
          //   onAdd={props.onAdd}
          //   onRemove={props.onRemove}
          token={props.displaySymbol}
        />

        {/* <NumberFormat
          value={prices.vaultShare?.toFixed(2)}
          thousandSeparator
          decimalScale={2}
          displayType="text"
          suffix="%"
          renderText={(val: string) => (
            <ThemedTextV2
              dark={tailwind("text-gray-50")}
              light={tailwind("text-gray-900")}
              style={tailwind("font-medium")}
              testID={`vault_detail_collateral_${props.displaySymbol}_vault_share`}
            >
              {val}
            </ThemedTextV2>
          )}
        /> */}
      </View>
    </ThemedViewV2>
  );
}

function CardLabel(props: { text: string }): JSX.Element {
  return (
    <ThemedTextV2
      light={tailwind("text-gray-500")}
      dark={tailwind("text-gray-400")}
      style={tailwind("text-xs mb-1")}
    >
      {translate("components/VaultDetailsCollateralsTab", props.text)}
    </ThemedTextV2>
  );
}
