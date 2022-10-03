import { ThemedIcon, ThemedTextV2, ThemedViewV2 } from "@components/themed";
import { tailwind } from "@tailwind";
import { Image, View, TouchableOpacity } from "react-native";
import EmptyCollateral from "@assets/images/loans/empty_collateral.png";
import LiquidatedVault from "@assets/images/loans/liquidated_vault.png";
import { translate } from "@translations";
import { ButtonV2 } from "@components/ButtonV2";
import { openURL } from "expo-linking";
import { useDeFiScanContext } from "@shared-contexts/DeFiScanContext";
import { VaultStatus } from "../VaultStatusTypes";

export function VaultBanner({
  description,
  onButtonPress,
  buttonLabel,
  vaultId,
  vaultType,
  onCardPress,
}: {
  description: string;
  onButtonPress: () => void;
  buttonLabel?: string;
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
        testID="vault_card"
      >
        <View style={tailwind("flex-row items-center")}>
          {vaultType === VaultStatus.Liquidated ? (
            <Image
              source={LiquidatedVault}
              style={{ width: 74, height: 64 }}
              resizeMode="contain"
            />
          ) : (
            <Image
              source={EmptyCollateral}
              style={{ width: 74, height: 64 }}
              resizeMode="contain"
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
              style={tailwind("font-normal-v2 text-sm text-right w-11/12")}
            >
              {translate("screens/LoansScreen", description)}
            </ThemedTextV2>
            {buttonLabel !== undefined && (
              <ButtonV2
                customButtonStyle="py-2 px-3"
                styleProps="mt-3"
                label={translate("components/EmptyVault", buttonLabel ?? "")}
                onPress={onButtonPress}
                testID="button_create_vault"
              />
            )}
          </View>
        </View>
      </ThemedViewV2>
    </TouchableOpacity>
  );
}
