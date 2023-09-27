import { useWalletContext } from "@shared-contexts/WalletContext";
import { useCallback } from "react";

export interface WalletAddressI {
  dvm: string;
  evm: string;
}

export function useWalletAddress(): {
  fetchWalletAddresses: () => Promise<WalletAddressI[]>;
} {
  const { wallet, addressLength } = useWalletContext();

  const fetchWalletAddresses = useCallback(async (): Promise<
    WalletAddressI[]
  > => {
    const addresses: WalletAddressI[] = [];
    for (let i = 0; i <= addressLength; i++) {
      const account = wallet.get(i);
      const dvm = await account.getAddress();
      // TODO (Harsh) replace it with getEvmAddress
      const evm = await account.getEvmAddress();
      addresses.push({ dvm, evm });
    }
    return addresses;
  }, [wallet, addressLength]);

  return { fetchWalletAddresses };
}
