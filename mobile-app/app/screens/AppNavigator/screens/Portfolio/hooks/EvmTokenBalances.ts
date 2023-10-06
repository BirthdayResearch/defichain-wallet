import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import { formatEther, formatUnits } from "viem";
import { useNetworkContext } from "@waveshq/walletkit-ui";
import { utils } from "ethers";
import {
  useGetEvmAddressDetailsMutation,
  useGetEvmTokenBalancesMutation,
} from "@store/evmApi";
import { DomainType, useDomainContext } from "@contexts/DomainContext";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import { useIsFocused } from "@react-navigation/native";
import { useLogger } from "@shared-contexts/NativeLoggingProvider";
import { DomainToken } from "./TokenBalance";

const GWEI_DECIMAL = 9; // Source: https://docs.ethers.org/v5/api/utils/display-logic/

export function useEvmTokenBalances(): { evmTokens: DomainToken[] } {
  // const { evmAddress } = useWalletContext();
  const evmAddress = "0x6aA59C49B27D9a3cBd9f976f7e6179F84be53C05";
  const [evmTokens, setEvmTokens] = useState<DomainToken[]>([]);
  const [allTokensWithAddress, setAllTokensWithAddress] = useState({});
  const [getEvmAddressDetails] = useGetEvmAddressDetailsMutation();
  const [getTokenBalances] = useGetEvmTokenBalancesMutation();
  const blockCount = useSelector((state: RootState) => state.block.count);
  const { network } = useNetworkContext();
  const isFocused = useIsFocused();
  const { domain } = useDomainContext();
  const logger = useLogger();

  const { allTokens } = useSelector((state: RootState) => state.wallet);

  useEffect(() => {
    setAllTokensWithAddress(
      Object.keys(allTokens).reduce((current, each) => {
        const tokenDetails = allTokens[each];
        const key = getAddressFromDST20TokenId(tokenDetails.id);
        return Object.assign(current, { [key]: tokenDetails });
      }, {}),
    );
  }, [allTokens]);
  // eslint-disable-next-line no-console
  console.log({ allTokensWithAddress });
  const getEvmTokens = async () => {
    // const dfiToken = {
    //   id: "0-EVM",
    //   symbol: "DFI",
    //   symbolKey: "DFI",
    //   isDAT: true,
    //   isLPS: false,
    //   isLoanToken: false,
    //   amount: "0",
    //   name: "DeFiChain",
    //   displaySymbol: "EvmDFI",
    //   avatarSymbol: "EvmDFI",
    // }
    const evmDfiToken: DomainToken = {
      tokenId: "0-EVM",
      available: new BigNumber(0),
      token: {
        name: "DFI for EVM",
        displaySymbol: "EvmDFI",
        displayTextSymbol: "DFI",
        symbol: "DFI",
        isLPS: false,
        domainType: DomainType.EVM,
      },
    };
    try {
      const details = await getEvmAddressDetails({
        network,
        evmAddress,
      }).unwrap();
      const evmDfiBalance = formatEther(BigInt(details.coin_balance ?? 0));
      evmDfiToken.available = new BigNumber(evmDfiBalance);
      const tokensBalances = await getTokenBalances({
        network,
        evmAddress,
      }).unwrap();
      // console.log({tokensBalances})
      // const evmTokens = tokensBalances.reduce((current, each) => {
      //   const tokenAddress = each?.token?.address
      //   const tokenDetails = allTokensWithAddress[tokenAddress] ?? null;
      //   if (tokenDetails) {
      //     return [...current, {
      //         id: "0-EVM",
      //         symbol: "DFI",
      //         symbolKey: "DFI",
      //         isDAT: true,
      //         isLPS: false,
      //         isLoanToken: false,
      //         amount: "0",
      //         name: "DeFiChain",
      //         displaySymbol: "EvmDFI",
      //         avatarSymbol: "EvmDFI",
      //       }]
      //   }
      //   return current
      //   // {
      //   //   id: "0-EVM",
      //   //   symbol: "DFI",
      //   //   symbolKey: "DFI",
      //   //   isDAT: true,
      //   //   isLPS: false,
      //   //   isLoanToken: false,
      //   //   amount: "0",
      //   //   name: "DeFiChain",
      //   //   displaySymbol: "EvmDFI",
      //   //   avatarSymbol: "EvmDFI",
      //   // }
      // }, [])

      const evmAddressTokens: DomainToken[] = tokensBalances
        // .filter(({ token }) => token.type === "DST20") // TODO (lyka): Add filter to only get DST20 tokens
        .map(({ token_id, value, token }) => ({
          tokenId: `${token_id}-EVM`,
          available: new BigNumber(
            formatUnits(
              BigInt(value ?? "0"),
              Number(token.decimals ?? GWEI_DECIMAL),
            ),
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
    } catch (e) {
      logger.error(e);
      setEvmTokens([evmDfiToken]);
    }
  };

  useEffect(() => {
    if (isFocused && domain === DomainType.EVM) {
      getEvmTokens();
    }
  }, [evmAddress, blockCount, isFocused, domain]);

  return { evmTokens };
}

// function getTokenIdFromAddress(ethAddress: string): string {
//   if (!ethAddress.startsWith('0xff') || ethAddress.length !== 42) {
//       throw new Error('Invalid Ethereum address format');
//   }
//   const hexTokenId = ethAddress.slice(4); // Remove '0xff' prefix
//   return BigInt(`0x${hexTokenId}`).toString();
// }

function getAddressFromDST20TokenId(tokenId: string): string {
  const parsedTokenId = BigInt(tokenId);
  const numberStr = parsedTokenId.toString(16); // Convert parsedTokenId to hexadecimal
  const paddedNumberStr = numberStr.padStart(38, "0"); // Pad with zeroes to the left
  const finalStr = `ff${paddedNumberStr}`;
  return utils.getAddress(finalStr);
}
