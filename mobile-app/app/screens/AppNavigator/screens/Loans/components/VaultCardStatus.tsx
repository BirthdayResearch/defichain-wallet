import { getColor, tailwind } from "@tailwind";
import CircularProgress from "react-native-circular-progress-indicator";
import BigNumber from "bignumber.js";
import { View } from "@components";
import { ThemedTextV2, ThemedTouchableOpacityV2 } from "@components/themed";
import { NumericFormat as NumberFormat } from "react-number-format";
import { LoanVaultActive } from "@defichain/whale-api-client/dist/api/loan";
import { VaultStatus } from "@screens/AppNavigator/screens/Loans/VaultStatusTypes";
import { translate } from "@translations";
import { Platform } from "react-native";
import {
  getProgress,
  getVaultStatusColor,
  getVaultStatusText,
} from "@screens/AppNavigator/screens/Loans/hooks/CollateralizationRatio";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { useLoanOperations } from "@screens/AppNavigator/screens/Loans/hooks/LoanOperations";
import { useUnitSuffix } from "@hooks/useUnitSuffix";

export interface VaultCardProgressProps extends React.ComponentProps<any> {
  vault: LoanVaultActive;
  vaultStatus: string;
  colRatio: string;
  minColRatio: string;
  onButtonPressed: () => void;
  testID: string;
}

export function VaultCardStatus({
  vault,
  vaultStatus,
  colRatio,
  minColRatio,
  onButtonPressed,
  testID,
}: VaultCardProgressProps): JSX.Element {
  const { isLight } = useThemeContext();
  const canUseOperations = useLoanOperations(vault?.state);
  const CIRCLE_RADIUS = 58;
  const isSuffixRequired = new BigNumber(colRatio ?? 0).gte(
    new BigNumber(1000)
  );
  const valueToUnitSuffix = useUnitSuffix(
    {
      3: "K",
      6: "M",
      9: "B",
      12: "T",
    },
    colRatio
  );

  return (
    <View style={tailwind("flex-wrap flex-col items-center")}>
      {Platform.OS !== "web" && (
        <CircularProgress
          radius={CIRCLE_RADIUS}
          value={
            vaultStatus === VaultStatus.Ready ||
            vaultStatus === VaultStatus.Halted
              ? 1
              : getProgress(colRatio, minColRatio)
          }
          maxValue={1}
          showProgressValue={false}
          activeStrokeWidth={3}
          activeStrokeColor={getVaultStatusColor(vaultStatus, isLight)}
          inActiveStrokeWidth={3}
          inActiveStrokeColor={getColor(
            isLight ? "mono-light-v2-100" : "mono-dark-v2-100"
          )}
          clockwise={false}
        />
      )}
      <View
        style={[
          tailwind("h-full", {
            absolute: Platform.OS !== "web",
          }),
          { maxHeight: CIRCLE_RADIUS * 2 },
        ]}
      >
        <View style={tailwind("flex-1 items-center justify-end px-2")}>
          <ThemedTextV2
            ellipsizeMode="middle"
            numberOfLines={1}
            style={[
              tailwind("font-normal-v2 text-xs px-2", {
                "px-5": Platform.OS === "web",
              }),
              {
                minWidth: 10,
                maxWidth: 124,
              },
            ]}
            testID={`${testID}_vault_id`}
            dark={tailwind("text-mono-dark-v2-700")}
            light={tailwind("text-mono-light-v2-700")}
          >
            {vault.vaultId}
          </ThemedTextV2>
          {vaultStatus === VaultStatus.Ready ||
          vaultStatus === VaultStatus.Halted ? (
            <ThemedTextV2
              dark={tailwind(
                "text-mono-dark-v2-900",
                getVaultStatusColor(vaultStatus, isLight, true)
              )}
              light={tailwind(
                "text-mono-light-v2-900",
                getVaultStatusColor(vaultStatus, isLight, true)
              )}
              style={tailwind("font-semibold-v2 text-base")}
              testID={`${testID}_status`}
            >
              {translate(
                "components/VaultCard",
                getVaultStatusText(vaultStatus)
              )}
            </ThemedTextV2>
          ) : (
            <NumberFormat
              value={new BigNumber(colRatio).toFixed(2)}
              decimalScale={2}
              thousandSeparator
              displayType="text"
              suffix="%"
              renderText={(value) => (
                <ThemedTextV2
                  dark={tailwind(
                    "text-mono-dark-v2-900",
                    getVaultStatusColor(vaultStatus, isLight, true)
                  )}
                  light={tailwind(
                    "text-mono-light-v2-900",
                    getVaultStatusColor(vaultStatus, isLight, true)
                  )}
                  style={tailwind("font-semibold-v2 text-base text-center")}
                  testID={`${testID}_min_ratio`}
                >
                  {isSuffixRequired ? `${valueToUnitSuffix} %` : value}
                </ThemedTextV2>
              )}
            />
          )}
        </View>

        {canUseOperations && (
          <ThemedTouchableOpacityV2
            onPress={
              vaultStatus === VaultStatus.Halted ? undefined : onButtonPressed
            }
            style={tailwind(
              "flex-wrap border-0 rounded-full self-center px-3 py-1 mt-4"
            )}
            dark={tailwind("bg-mono-dark-v2-1000", {
              "bg-gray-600": vaultStatus === VaultStatus.Halted,
            })}
            light={tailwind("bg-mono-light-v2-1000", {
              "bg-gray-400": vaultStatus === VaultStatus.Halted,
            })}
            activeOpacity={vaultStatus === VaultStatus.Halted ? 1 : 0.7}
          >
            <ThemedTextV2
              style={tailwind("flex-wrap self-center text-xs font-semibold-v2")}
              light={tailwind("text-mono-light-v2-100")}
              dark={tailwind("text-mono-dark-v2-100")}
              testID={`${testID}_borrow_button`}
            >
              {translate("components/VaultCard", "Borrow")}
            </ThemedTextV2>
          </ThemedTouchableOpacityV2>
        )}
      </View>
    </View>
  );
}
