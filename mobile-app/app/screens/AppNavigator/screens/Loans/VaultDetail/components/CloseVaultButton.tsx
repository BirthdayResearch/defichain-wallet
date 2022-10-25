import { tailwind } from "@tailwind";
import { ThemedTextV2, ThemedTouchableOpacityV2 } from "@components/themed";
import { translate } from "@translations";
import { VaultStatus } from "@screens/AppNavigator/screens/Loans/VaultStatusTypes";

export interface CloseVaultButtonProps {
  vaultStatus: string;
  canUseOperations: boolean;
  onCloseVaultPressed: () => void;
}

export function CloseVaultButton({
  vaultStatus,
  canUseOperations,
  onCloseVaultPressed,
}: CloseVaultButtonProps): JSX.Element {
  const isCloseVaultDisabled =
    !canUseOperations ||
    (vaultStatus !== VaultStatus.Empty && vaultStatus !== VaultStatus.Ready);

  return (
    <ThemedTouchableOpacityV2
      onPress={onCloseVaultPressed}
      style={tailwind("rounded-lg-v2 items-center mx-5 mt-16")}
      light={tailwind("bg-mono-light-v2-00", {
        "opacity-30": isCloseVaultDisabled,
      })}
      dark={tailwind("bg-mono-dark-v2-00", {
        "opacity-30": isCloseVaultDisabled,
      })}
      disabled={isCloseVaultDisabled}
    >
      <ThemedTextV2
        style={tailwind("font-normal-v2 text-sm py-4.5")}
        light={tailwind("text-red-v2")}
        dark={tailwind("text-red-v2")}
      >
        {translate("screens/VaultDetailScreen", "Close vault")}
      </ThemedTextV2>
    </ThemedTouchableOpacityV2>
  );
}
