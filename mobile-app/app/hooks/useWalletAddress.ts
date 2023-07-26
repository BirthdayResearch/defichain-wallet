import { useWalletContext } from "@shared-contexts/WalletContext";
import { useCallback } from "react";

export interface WalletAddressI {
  dfi: string;
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
      const dfi = await account.getAddress();
      const evm = await account.getEvmAddress();
      addresses.push({ dfi, evm });
    }
    return addresses;
  }, [wallet, addressLength]);

  return { fetchWalletAddresses };
}
