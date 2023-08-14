import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import { formatEther, formatUnits } from "viem";
import { useNetworkContext } from "@waveshq/walletkit-ui";
import { useWalletContext } from "@shared-contexts/WalletContext";
import {
  useGetEvmAddressDetailsMutation,
  useGetEvmTokenBalancesMutation,
} from "@store/evmApi";
import { DomainType } from "@contexts/DomainContext";
import { DomainToken } from "./TokenBalance";

const GWEI_DECIMAL = 9; // Source: https://docs.ethers.org/v5/api/utils/display-logic/

export function useEvmTokenBalances(): { evmTokens: DomainToken[] } {
  const { evmAddress } = useWalletContext();
  const [evmTokens, setEvmTokens] = useState<DomainToken[]>([]);
  const [getEvmAddressDetails] = useGetEvmAddressDetailsMutation();
  const [getTokenBalances] = useGetEvmTokenBalancesMutation();
  const { network } = useNetworkContext();

  const getEvmTokens = async () => {
    const details = await getEvmAddressDetails({
      network,
      evmAddress,
    }).unwrap();
    const evmDfiBalance = formatEther(BigInt(details.coin_balance ?? 0));
    const evmDfiToken: DomainToken = {
      tokenId: "0-EVM",
      available: new BigNumber(evmDfiBalance),
      token: {
        name: "DFI for EVM",
        displaySymbol: "EvmDFI",
        displayTextSymbol: "DFI",
        symbol: "DFI",
        isLPS: false,
        domainType: DomainType.EVM,
      },
    };

    const tokens = await getTokenBalances({ network, evmAddress }).unwrap();
    const evmAddressTokens: DomainToken[] = tokens
      // .filter(({ token }) => token.type === "DST20") // TODO (lyka): Add filter to only get DST20 tokens
      .map(({ token_id, value, token }) => ({
        tokenId: `${token_id}-EVM`,
        available: new BigNumber(
          formatUnits(
            BigInt(value ?? "0"),
            Number(token.decimals ?? GWEI_DECIMAL)
          )
        ),
        token: {
          name: `${token.name} for EVM`,
          displaySymbol: token.symbol,
          displayTextSymbol: token.symbol,
          symbol: token.symbol,
          isLPS: false,
          domainType: DomainType.EVM,
        },
      }));

    setEvmTokens([evmDfiToken, ...evmAddressTokens]);
  };

  useEffect(() => {
    getEvmTokens();
  }, []);

  return { evmTokens };
}
