import { ThemedIcon, ThemedTextV2, ThemedViewV2 } from "@components/themed";
import { tailwind } from "@tailwind";
import { Image, View, TouchableOpacity } from "react-native";
import EmptyCollateral from "@assets/images/loans/empty_collateral.png";
import LiquidatedVault from "@assets/images/loans/liquidated_vault.png";
import { translate } from "@translations";
import { ButtonV2 } from "@components/ButtonV2";
import { openURL } from "expo-linking";
import { useDeFiScanContext } from "@shared-contexts/DeFiScanContext";
import { TokenIconGroupV2 } from "@components/TokenIconGroup";
import { LoanVaultActive } from "@defichain/whale-api-client/dist/api/loan";
import { VaultStatus } from "../VaultStatusTypes";

export function VaultBanner({
  description,
  onButtonPress,
  buttonLabel,
  vault,
  vaultId,
  vaultType,
  onCardPress,
  testID,
}: {
  description: string;
  onButtonPress: () => void;
  testID: string;
  buttonLabel: string;
  vault?: LoanVaultActive;
  vaultId?: string;
  vaultType?: string;
  onCardPress?: () => void;
}): JSX.Element {
  const { getVaultsUrl } = useDeFiScanContext();
  return (
    <TouchableOpacity onPress={onCardPress} activeOpacity={1}>
      <ThemedViewV2
        dark={tailwind("bg-mono-dark-v2-00")}
        light={tailwind("bg-mono-light-v2-00")}
        style={tailwind("p-5 rounded-lg-v2 border-0")}
      >
        <View style={tailwind("flex-row items-center")}>
          {vaultType === VaultStatus.Liquidated ? (
            <Image
              source={LiquidatedVault}
              style={{ width: 74, height: 64 }}
              resizeMode="contain"
              testID={`${testID}_vault_type`}
            />
          ) : (
            <Image
              source={EmptyCollateral}
              style={{ width: 74, height: 64 }}
              resizeMode="contain"
              testID={`${testID}_vault_type`}
            />
          )}

          <View style={tailwind("flex-1 items-end")}>
            {vaultId !== undefined && (
              <>
                <TouchableOpacity
                  style={tailwind("flex-row items-center")}
                  onPress={async () => await openURL(getVaultsUrl(vaultId))}
                >
                  <ThemedTextV2
                    ellipsizeMode="middle"
                    numberOfLines={1}
                    style={[
                      tailwind("text-sm text-right"),
                      { minWidth: 10, maxWidth: 124 },
                    ]}
                    dark={tailwind("text-mono-dark-v2-700")}
                    light={tailwind("text-mono-light-v2-700")}
                    testID={`${testID}_vault_id`}
                  >
                    {vaultId}
                  </ThemedTextV2>

                  <ThemedIcon
                    dark={tailwind("text-mono-dark-v2-700")}
                    light={tailwind("text-mono-light-v2-700")}
                    iconType="Feather"
                    name="external-link"
                    size={16}
                    style={tailwind("ml-1")}
                  />
                </TouchableOpacity>
              </>
            )}
            <ThemedTextV2
              style={tailwind(
                "font-normal-v2 text-sm text-right w-11/12 text-red-v2"
              )}
              // light={tailwind({
              //   "text-red-v2": vaultType === VaultStatus.Liquidated,
              // })}
              // dark={tailwind({
              //   "text-red-v2": vaultType === VaultStatus.Liquidated,
              // })}
              testID={`${testID}_vault_description`}
            >
              {translate("screens/LoansScreen", description)}
            </ThemedTextV2>
            {buttonLabel !== "" && (
              <ButtonV2
                customButtonStyle="py-2 px-3"
                customTextStyle="text-xs"
                styleProps="mt-3"
                label={translate("components/EmptyVault", buttonLabel)}
                onPress={onButtonPress}
                testID={`${testID}_add_collateral_button`}
              />
            )}
            {vault !== undefined && vaultType === VaultStatus.Liquidated && (
              <TokenIconGroupV2
                testID={`${testID}_collateral_token_group`}
                symbols={vault.collateralAmounts?.map(
                  (collateral) => collateral.displaySymbol
                )}
                maxIconToDisplay={6}
              />
            )}
          </View>
        </View>
      </ThemedViewV2>
    </TouchableOpacity>
  );
}
