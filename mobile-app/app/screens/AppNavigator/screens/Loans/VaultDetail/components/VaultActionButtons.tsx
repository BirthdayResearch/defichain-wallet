import { View } from "react-native";
import { tailwind } from "@tailwind";
import {
  ThemedIcon,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
} from "@components/themed";
import { translate } from "@translations";
import { VaultStatus } from "@screens/AppNavigator/screens/Loans/VaultStatusTypes";

export interface VaultActionButtonsProps {
  vaultStatus?: string;
  canUseOperations: boolean;
  onAddPressed: () => void;
  onBorrowPressed: () => void;
  onPayPressed: () => void;
  onEditPressed: () => void;
}

export function VaultActionButtons({
  vaultStatus,
  canUseOperations,
  onAddPressed,
  onBorrowPressed,
  onPayPressed,
  onEditPressed,
}: VaultActionButtonsProps): JSX.Element {
  const isBorrowDisabled =
    vaultStatus === VaultStatus.Empty || vaultStatus === VaultStatus.Halted;
  const isPayDisabled =
    vaultStatus === VaultStatus.Empty || vaultStatus === VaultStatus.Ready;

  const buttons = [
    {
      title: "Add",
      icon: "plus",
      isDisabled: !canUseOperations,
      onPress: onAddPressed,
      testID: "action_add",
    },
    {
      title: "Borrow",
      icon: "arrow-down-circle",
      isDisabled: !canUseOperations || isBorrowDisabled,
      onPress: onBorrowPressed,
      testID: "action_borrow",
    },
    {
      title: "Pay",
      icon: "credit-card",
      isDisabled: !canUseOperations || isPayDisabled,
      onPress: onPayPressed,
      testID: "action_pay",
    },
    {
      title: "Edit",
      icon: "edit-2",
      isDisabled: !canUseOperations,
      onPress: onEditPressed,
      testID: "action_edit",
    },
  ];

  return (
    <View
      style={tailwind("flex-1 flex-row items-center justify-center pt-6 px-5")}
    >
      {buttons.map((button) => (
        <View
          style={tailwind("flex-1 flex-col items-center px-3")}
          key={button.title}
        >
          <ThemedTouchableOpacityV2
            onPress={button.onPress}
            style={tailwind("rounded-full p-4.5")}
            light={tailwind("bg-mono-light-v2-00", {
              "opacity-30": button.isDisabled,
            })}
            dark={tailwind("bg-mono-dark-v2-00", {
              "opacity-30": button.isDisabled,
            })}
            disabled={button.isDisabled}
            testID={button.testID}
          >
            <ThemedIcon
              iconType="Feather"
              name={button.icon}
              light={tailwind("text-mono-light-v2-900")}
              dark={tailwind("text-mono-dark-v2-900")}
              size={24}
            />
          </ThemedTouchableOpacityV2>
          <ThemedTextV2
            style={tailwind("font-normal-v2 text-xs pt-2", {
              "opacity-30": button.isDisabled,
            })}
          >
            {translate("screens/VaultDetailScreen", button.title)}
          </ThemedTextV2>
        </View>
      ))}
    </View>
  );
}
