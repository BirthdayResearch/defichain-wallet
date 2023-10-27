import {
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2,
} from "@components/themed";
import { tailwind } from "@tailwind";
import { useAddressLabel } from "@hooks/useAddressLabel";
import { DomainType, useDomainContext } from "@contexts/DomainContext";
import { useWalletContext } from "@shared-contexts/WalletContext";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import { useEffect, useState } from "react";
import { useWalletAddress, WalletAddressI } from "@hooks/useWalletAddress";
import { useLogger } from "@shared-contexts/NativeLoggingProvider";
import { RandomAvatar } from "./RandomAvatar";

interface AddressSelectionButtonProps {
  onPress?: () => void;
  disabled?: boolean;
}

export function AddressSelectionButtonV2(
  props: AddressSelectionButtonProps,
): JSX.Element {
  const { domain } = useDomainContext();
  const { address, evmAddress } = useWalletContext();
  const displayAddress = domain === DomainType.EVM ? evmAddress : address;
  const activeLabel = useAddressLabel(displayAddress);
  const { fetchWalletAddresses } = useWalletAddress();

  const userPreferences = useSelector(
    (state: RootState) => state.userPreferences,
  );
  const labeledAddresses = userPreferences.addresses;
  const logger = useLogger();

  const [availableAddresses, setAvailableAddresses] = useState<
    WalletAddressI[]
  >([]);

  // Getting addresses
  const fetchAddresses = async (): Promise<void> => {
    const addresses = await fetchWalletAddresses();
    setAvailableAddresses(addresses);
  };

  const activeAddress = availableAddresses.find(({ dvm }) => dvm === address);
  const displayAddressLabel =
    activeLabel === null
      ? activeAddress?.generatedLabel
      : labeledAddresses?.[address]?.label;

  useEffect(() => {
    fetchAddresses().catch(logger.error);
  }, [address]);

  return (
    <ThemedTouchableOpacityV2
      light={tailwind("bg-transparent")}
      dark={tailwind("bg-transparent")}
      style={tailwind("flex flex-row items-center overflow-hidden")}
      onPress={props.onPress}
      testID="switch_account_button"
      disabled={props.disabled}
    >
      <ThemedViewV2
        light={tailwind("bg-mono-light-v2-900")}
        dark={tailwind("bg-mono-dark-v2-900")}
        style={tailwind("p-0.5 rounded-full")}
      >
        <RandomAvatar name={address} size={24} />
      </ThemedViewV2>
      <ThemedTextV2
        ellipsizeMode="middle"
        numberOfLines={1}
        style={[
          tailwind("text-sm font-semibold-v2 ml-2"),
          { minWidth: 10, maxWidth: 124 },
        ]}
        testID="wallet_address"
      >
        {displayAddressLabel}
      </ThemedTextV2>
    </ThemedTouchableOpacityV2>
  );
}
