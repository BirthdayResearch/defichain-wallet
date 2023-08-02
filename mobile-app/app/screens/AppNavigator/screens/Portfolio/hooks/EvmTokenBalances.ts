import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { AddressToken } from "@defichain/whale-api-client/dist/api/address";
import { useNetworkContext } from "@waveshq/walletkit-ui";
import { useWalletContext } from "@shared-contexts/WalletContext";
import { useGetEvmTokenBalancesMutation } from "@store/ethRpc";

const GWEI_DECIMAL = 9; // Source: https://docs.ethers.org/v5/api/utils/display-logic/

export function useEvmTokenBalances(): { evmTokens: AddressToken[] } {
  const { address } = useWalletContext();
  const [evmTokens, setEvmTokens] = useState<AddressToken[]>([]);
  const [getTokenBalances] = useGetEvmTokenBalancesMutation();
  const { network } = useNetworkContext();

  const getEvmTokens = async () => {
    const tokens = await getTokenBalances({
      network,
      address,
    }).unwrap();

    const evmAddressTokens: AddressToken[] = tokens
      // .filter(({ token }) => token.type === "DST20") // TODO (lyka): Add filter to only get DFI and DST20 tokens
      .map(({ token_id, value, token }) => ({
        id: token.symbol === "DACKIE" ? "0" : token_id, // TODO (lyka): use `DFI` symbol instead
        amount: formatUnits(
          BigInt(value ?? "0"),
          Number(token.decimals ?? GWEI_DECIMAL)
        ),
        symbol: token.symbol,
        displaySymbol: token.symbol === "DACKIE" ? "EvmDFI" : token.symbol, // TODO (lyka): use `DFI` symbol instead
        symbolKey: token.symbol,
        name: token.name,
        isDAT: false,
        isLPS: false,
        isLoanToken: false,
      }));

    setEvmTokens(evmAddressTokens);
  };

  useEffect(() => {
    getEvmTokens();
  }, []);

  return { evmTokens };
}
