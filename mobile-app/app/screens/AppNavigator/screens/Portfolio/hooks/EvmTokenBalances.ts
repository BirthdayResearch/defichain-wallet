import { useEffect, useState } from "react";
import { formatEther, formatUnits } from "viem";
import { AddressToken } from "@defichain/whale-api-client/dist/api/address";
import { useNetworkContext } from "@waveshq/walletkit-ui";
import { useWalletContext } from "@shared-contexts/WalletContext";
import {
  useGetEvmAddressDetailsMutation,
  useGetEvmTokenBalancesMutation,
} from "@store/evmApi";

const GWEI_DECIMAL = 9; // Source: https://docs.ethers.org/v5/api/utils/display-logic/

export function useEvmTokenBalances(): { evmTokens: AddressToken[] } {
  const { address } = useWalletContext();
  const [evmTokens, setEvmTokens] = useState<AddressToken[]>([]);
  const [getEvmAddressDetails] = useGetEvmAddressDetailsMutation();
  const [getTokenBalances] = useGetEvmTokenBalancesMutation();
  const { network } = useNetworkContext();

  const getEvmTokens = async () => {
    const details = await getEvmAddressDetails({ network, address }).unwrap();
    const evmDfiBalance = formatEther(details.coin_balance ?? 0);
    const evmDfiToken = {
      id: "0",
      amount: evmDfiBalance,
      symbol: "DFI",
      displaySymbol: "EvmDFI",
      symbolKey: "DFI",
      name: "DFI",
      isDAT: false,
      isLPS: false,
      isLoanToken: false,
    };

    const tokens = await getTokenBalances({ network, address }).unwrap();
    const evmAddressTokens: AddressToken[] = tokens
      // .filter(({ token }) => token.type === "DST20") // TODO (lyka): Add filter to only get DST20 tokens
      .map(({ token_id, value, token }) => ({
        id: token_id,
        amount: formatUnits(
          BigInt(value ?? "0"),
          Number(token.decimals ?? GWEI_DECIMAL)
        ),
        symbol: token.symbol,
        displaySymbol: token.symbol,
        symbolKey: token.symbol,
        name: token.name,
        isDAT: false,
        isLPS: false,
        isLoanToken: false,
      }));

    setEvmTokens([evmDfiToken, ...evmAddressTokens]);
  };

  useEffect(() => {
    getEvmTokens();
  }, []);

  return { evmTokens };
}
