import { useWalletContext } from "@shared-contexts/WalletContext";
import { useStyles } from "@tailwind";
import { translate } from "@translations";
import { View } from "@components";
import { AddressSelectionButton } from "@screens/AppNavigator/screens/Portfolio/components/AddressSelectionButton";
import { ThemedView, ThemedText } from "./themed";

export function WalletAddressRow(): JSX.Element {
  const { tailwind } = useStyles();
  const { address, addressLength } = useWalletContext();

  return (
    <ThemedView
      dark={tailwind("bg-gray-800 border-b border-gray-700")}
      light={tailwind("bg-white border-b border-gray-300")}
      style={tailwind("p-4 flex-row w-full items-center justify-between")}
    >
      <ThemedText style={tailwind("text-sm")} testID="wallet_address_text">
        {translate("components/WalletAddressRow", "Wallet address")}
      </ThemedText>
      <View>
        <AddressSelectionButton
          address={address}
          addressLength={addressLength}
          disabled
        />
      </View>
    </ThemedView>
  );
}
