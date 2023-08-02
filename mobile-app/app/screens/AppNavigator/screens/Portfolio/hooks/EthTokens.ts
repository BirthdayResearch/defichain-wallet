import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { AddressToken } from "@defichain/whale-api-client/dist/api/address";
import { useNetworkContext } from "@waveshq/walletkit-ui";
import { useWalletContext } from "@shared-contexts/WalletContext";
import { useGetEthTokenBalancesMutation } from "@store/ethRpc";

const GWEI_DECIMAL = 9; // Source: https://docs.ethers.org/v5/api/utils/display-logic/

export function useGetEthTokens(): { ethTokens: AddressToken[] } {
  const { address } = useWalletContext();
  const [ethTokens, setEthTokens] = useState<AddressToken[]>([]);
  const [getTokenBalances] = useGetEthTokenBalancesMutation();
  const { network } = useNetworkContext();

  const getEthTokens = async () => {
    const tokens = await getTokenBalances({
      network,
      address,
    }).unwrap();

    const ethAddressTokens: AddressToken[] = tokens
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

    setEthTokens(ethAddressTokens);
  };

  useEffect(() => {
    getEthTokens();
  }, []);

  return { ethTokens };
}
