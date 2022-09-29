import { ThemedIcon, ThemedTextV2, ThemedViewV2 } from "@components/themed";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { tailwind } from "@tailwind";
import { Image, View } from "react-native";
import EmptyCollateral from "@assets/images/loans/empty_collateral.png";
import LiquidatedVault from "@assets/images/loans/liquidated_vault.png";
import { translate } from "@translations";
import { ButtonV2 } from "@components/ButtonV2";
import { TouchableOpacity } from "react-native-gesture-handler";
import { openURL } from "expo-linking";
import { useDeFiScanContext } from "@shared-contexts/DeFiScanContext";
import { VaultStatus } from "../VaultStatusTypes";

export function VaultBanner({
  buttonLabel,
  vaultId,
  description,
  onPress,
  onCardPress,
  onBottomSheetLoansInfoSelect,
  vaultType,
}: {
  buttonLabel?: string;
  vaultId?: string;
  vaultType?: string;
  description: string;
  onPress: () => void;
  onCardPress: () => void;
  onBottomSheetLoansInfoSelect?: () => void;
}): JSX.Element {
  const { getVaultsUrl } = useDeFiScanContext();
  return (
    <TouchableOpacity onPress={onCardPress}>
      <ThemedViewV2
        dark={tailwind("bg-mono-dark-v2-00")}
        light={tailwind("bg-mono-light-v2-00")}
        style={tailwind("px-5 py-4.5 rounded-lg-v2 border-0")}
        testID="vault_card"
      >
        <View style={tailwind("flex-row items-center")}>
          {vaultType === VaultStatus.Liquidated && (
            <Image
              source={LiquidatedVault}
              style={{ width: 74, height: 64 }}
              resizeMode="contain"
            />
          )}
          {vaultType === VaultStatus.Empty && (
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
              {translate("", description)}
            </ThemedTextV2>
            {buttonLabel !== "" && (
              <ButtonV2
                styleProps="mt-3 text-sm"
                label={buttonLabel}
                onPress={onPress}
                testID="button_create_vault"
              />
            )}
          </View>
        </View>
      </ThemedViewV2>
      <View style={tailwind("px-10")}>
        {onBottomSheetLoansInfoSelect !== undefined && (
          <View style={tailwind("flex-row items-center")}>
            <ThemedTextV2
              dark={tailwind("text-mono-dark-v2-500")}
              light={tailwind("text-mono-light-v2-500")}
              style={tailwind("font-normal-v2 text-sm")}
            >
              {translate("", "Loan tokens get their prices from oracles.")}
            </ThemedTextV2>
            <TouchableOpacity
              onPress={onBottomSheetLoansInfoSelect}
              style={tailwind("pl-1")}
            >
              <ThemedIcon
                dark={tailwind("text-mono-dark-v2-700")}
                light={tailwind("text-mono-light-v2-700")}
                iconType="MaterialIcons"
                name="info-outline"
                size={16}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
