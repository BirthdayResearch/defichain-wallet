import {
  ThemedIcon,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2,
} from "@components/themed";
import { tailwind } from "@tailwind";
import { Image, View } from "react-native";
import EmptyCollateral from "@assets/images/loans/empty_collateral.png";
import LiquidatedVault from "@assets/images/loans/liquidated_vault.png";
import { translate } from "@translations";
import { ButtonV2 } from "@components/ButtonV2";
import { openURL } from "expo-linking";
import { useDeFiScanContext } from "@shared-contexts/DeFiScanContext";
import { LoanVault } from "@store/loans";
import { LoanVaultState } from "@defichain/whale-api-client/dist/api/loan";
import { TokenIconGroupV2 } from "@components/TokenIconGroupV2";
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
  vault?: LoanVault;
  vaultId?: string;
  vaultType?: string;
  onCardPress?: () => void;
}): JSX.Element {
  const { getVaultsUrl } = useDeFiScanContext();
  return (
    <ThemedTouchableOpacityV2
      onPress={onCardPress}
      style={tailwind("border-0")}
      activeOpacity={onCardPress === undefined ? 1 : 0.7}
      testID={testID}
    >
      <ThemedViewV2
        dark={tailwind("bg-mono-dark-v2-00")}
        light={tailwind("bg-mono-light-v2-00")}
        style={tailwind("p-5 rounded-lg-v2 border-0")}
        testID={`${testID}_vault`}
      >
        <View style={tailwind("flex-row items-center")}>
          {vaultType === VaultStatus.Liquidated ? (
            <Image
              source={LiquidatedVault}
              style={{
                width: 74,
                height: 64,
              }}
              resizeMode="contain"
              testID={`${testID}_liquidated_vault_image`}
            />
          ) : (
            <Image
              source={EmptyCollateral}
              style={{
                width: 74,
                height: 64,
              }}
              resizeMode="contain"
              testID={`${testID}_empty_vault_image`}
            />
          )}

          <View style={tailwind("flex-1 flex-col items-end")}>
            {vaultId !== undefined && (
              <>
                <ThemedTouchableOpacityV2
                  style={tailwind("flex-row items-center border-0")}
                  onPress={async () => await openURL(getVaultsUrl(vaultId))}
                  disabled={vaultType !== VaultStatus.Liquidated}
                >
                  <ThemedTextV2
                    ellipsizeMode="middle"
                    numberOfLines={1}
                    style={[
                      tailwind("text-xs text-right"),
                      {
                        minWidth: 10,
                        maxWidth: 124,
                      },
                    ]}
                    dark={tailwind("text-mono-dark-v2-700")}
                    light={tailwind("text-mono-light-v2-700")}
                    testID={`${testID}_vault_id`}
                  >
                    {vaultId}
                  </ThemedTextV2>

                  {vaultType === VaultStatus.Liquidated && (
                    <ThemedIcon
                      dark={tailwind("text-mono-dark-v2-700")}
                      light={tailwind("text-mono-light-v2-700")}
                      iconType="Feather"
                      name="external-link"
                      size={16}
                      style={tailwind("ml-1")}
                    />
                  )}
                </ThemedTouchableOpacityV2>
              </>
            )}
            <ThemedTextV2
              style={tailwind("font-normal-v2 text-xs text-right w-11/12 mt-1")}
              light={tailwind("text-mono-light-v2-900", {
                "text-red-v2": vaultType === VaultStatus.Liquidated,
              })}
              dark={tailwind("text-mono-dark-v2-900", {
                "text-red-v2": vaultType === VaultStatus.Liquidated,
              })}
              testID={`${testID}_vault_description`}
            >
              {translate("components/VaultCard", description)}
            </ThemedTextV2>
            {buttonLabel !== "" && (
              <ButtonV2
                customButtonStyle="py-2 px-3"
                customTextStyle="text-sm"
                styleProps="mt-3"
                label={translate("components/VaultCard", buttonLabel)}
                onPress={onButtonPress}
                testID={`${testID}_add_collateral_button`}
              />
            )}
            {vault !== undefined &&
              vault.state === LoanVaultState.IN_LIQUIDATION &&
              vault.batches.length > 0 && (
                <View style={tailwind("mt-3")}>
                  <TokenIconGroupV2
                    testID={`${testID}_collateral_token_group`}
                    symbols={vault.batches[0].collaterals?.map(
                      (collateral) => collateral.displaySymbol
                    )}
                    maxIconToDisplay={6}
                    size={24}
                  />
                </View>
              )}
          </View>
        </View>
      </ThemedViewV2>
    </ThemedTouchableOpacityV2>
  );
}
