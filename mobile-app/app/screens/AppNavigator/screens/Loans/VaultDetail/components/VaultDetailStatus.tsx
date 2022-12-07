import { useThemeContext } from "@shared-contexts/ThemeProvider";
import BigNumber from "bignumber.js";
import { useUnitSuffix } from "@hooks/useUnitSuffix";
import { Platform, View } from "react-native";
import CircularProgress from "react-native-circular-progress-indicator";
import { VaultStatus } from "@screens/AppNavigator/screens/Loans/VaultStatusTypes";
import { useStyles } from "@tailwind";
import { ThemedTextV2 } from "@components/themed";
import { NumericFormat as NumberFormat } from "react-number-format";
import {
  getProgress,
  getVaultStatusColor,
  getVaultStatusText,
} from "@screens/AppNavigator/screens/Loans/hooks/CollateralizationRatio";
import { LoanVault } from "@store/loans";
import { LoanVaultState } from "@defichain/whale-api-client/dist/api/loan";
import { useMemo } from "react";
import { translate } from "@translations";

export interface VaultDetailStatusProps {
  vault: LoanVault;
  vaultStatus?: string;
  nextColRatio?: BigNumber;
}

export function VaultDetailStatus({
  vault,
  vaultStatus,
  nextColRatio,
}: VaultDetailStatusProps): JSX.Element {
  const { tailwind, getColor } = useStyles();
  const { isLight } = useThemeContext();
  const CIRCLE_RADIUS = 78;
  const colRatio =
    vault.state === LoanVaultState.IN_LIQUIDATION
      ? "0"
      : vault.informativeRatio;
  const minColRatio = vault.loanScheme.minColRatio;
  const isSuffixRequired = new BigNumber(colRatio).gte(new BigNumber(1000));
  const unit = {
    3: "K",
    6: "M",
    9: "B",
    12: "T",
  };
  const valueToUnitSuffix = useUnitSuffix(unit, colRatio);
  const isNextSuffixRequired = new BigNumber(nextColRatio ?? 0).gte(
    new BigNumber(1000)
  );
  const valueToUnitNextSuffix = useUnitSuffix(
    unit,
    nextColRatio?.toString() ?? "0"
  );

  const vaultProgress = useMemo(() => {
    if (vaultStatus === VaultStatus.Empty) {
      return 0;
    } else if (
      vaultStatus === VaultStatus.Ready ||
      vaultStatus === VaultStatus.Halted
    ) {
      return 1;
    } else {
      return getProgress(colRatio, minColRatio);
    }
  }, [vaultStatus]);

  return (
    <View style={tailwind("items-center justify-center mt-8")}>
      {Platform.OS !== "web" && (
        <CircularProgress
          radius={CIRCLE_RADIUS}
          value={vaultProgress}
          maxValue={1}
          showProgressValue={false}
          activeStrokeWidth={3}
          activeStrokeColor={getVaultStatusColor(vaultStatus, isLight)}
          inActiveStrokeWidth={3}
          inActiveStrokeColor={getColor(
            isLight ? "mono-light-v2-00" : "mono-dark-v2-00"
          )}
          clockwise={false}
        />
      )}
      <View
        style={[
          tailwind("h-full justify-center", {
            absolute: Platform.OS !== "web",
          }),
          { maxHeight: CIRCLE_RADIUS * 2 },
        ]}
      >
        {vaultStatus === VaultStatus.Ready ||
        vaultStatus === VaultStatus.Halted ||
        vaultStatus === VaultStatus.Empty ? (
          <ThemedTextV2
            dark={tailwind(
              "text-mono-dark-v2-900",
              getVaultStatusColor(vaultStatus, isLight, true)
            )}
            light={tailwind(
              "text-mono-light-v2-900",
              getVaultStatusColor(vaultStatus, isLight, true)
            )}
            style={tailwind("font-semibold-v2 text-2xl", {
              "font-normal-v2": vaultStatus === VaultStatus.Empty,
            })}
            testID="vault_status"
          >
            {translate(
              "screens/VaultDetailScreen",
              getVaultStatusText(vaultStatus)
            )}
          </ThemedTextV2>
        ) : (
          <View style={tailwind("flex-col items-center")}>
            <NumberFormat
              value={new BigNumber(colRatio).toFixed(2)}
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
                  style={tailwind("font-semibold-v2 text-2xl text-center")}
                  testID="vault_ratio"
                >
                  {isSuffixRequired ? `${valueToUnitSuffix} %` : value}
                </ThemedTextV2>
              )}
            />
            <NumberFormat
              value={nextColRatio?.toFixed(2) ?? BigNumber("0").toFixed(2)}
              thousandSeparator
              displayType="text"
              suffix="%"
              renderText={(value) => (
                <ThemedTextV2
                  dark={tailwind("text-mono-dark-v2-700")}
                  light={tailwind("text-mono-light-v2-700")}
                  style={tailwind("font-normal-v2 text-xs text-center")}
                  testID="vault_next_col_ratio"
                >
                  {`${
                    isNextSuffixRequired ? `${valueToUnitNextSuffix} %` : value
                  } ${translate("screens/VaultDetailScreen", "next")}`}
                </ThemedTextV2>
              )}
            />
          </View>
        )}
      </View>
    </View>
  );
}
