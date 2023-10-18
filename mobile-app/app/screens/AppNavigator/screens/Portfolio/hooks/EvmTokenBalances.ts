import { useEffect, useState } from "react";
import { WalletToken, useNetworkContext } from "@waveshq/walletkit-ui";
import { utils } from "ethers";
import { batch, useSelector } from "react-redux";
import { RootState } from "@store";
import { TokenData } from "@defichain/whale-api-client/dist/api/tokens";
import { useLogger } from "@shared-contexts/NativeLoggingProvider";
import { useWalletContext } from "@shared-contexts/WalletContext";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { fetchEvmWalletDetails, fetchEvmTokenBalances } from "@store/evm";
import { useEVMProvider } from "@contexts/EVMProvider";
import { useIsFocused } from "@react-navigation/native";
import { getAddressFromDST20TokenId } from "@api/transaction/transfer_domain";
import { useCustomServiceProviderContext } from "@contexts/CustomServiceProvider";

interface AssociatedToken {
  [key: string]: TokenData;
}

export function useEvmTokenBalances(): { evmTokens: WalletToken[] } {
  const { evmAddress } = useWalletContext();
  const [evmTokens, setEvmTokens] = useState<WalletToken[]>([]);
  const [allTokensWithAddress, setAllTokensWithAddress] =
    useState<AssociatedToken>({});
  const blockCount = useSelector((state: RootState) => state.block.count);
  const { network } = useNetworkContext();
  const { evmUrl } = useCustomServiceProviderContext();
  const { provider } = useEVMProvider();
  const logger = useLogger();
  const isFocused = useIsFocused();

  const { allTokens } = useSelector((state: RootState) => state.wallet);
  const tokenIds = Object.keys(allTokens).reduce((current: string[], key) => {
    const token = allTokens[key];
    if (token.id !== "0" && token.isDAT && !token.isLPS) {
      return [...current, token.id];
    }
    return current;
  }, []);
  const { evmWalletDetails, evmTokenBalances } = useSelector(
    (state: RootState) => state.evm,
  );
  const dispatch = useAppDispatch();

  const getEvmTokens = async () => {
    const dfiToken: WalletToken = {
      id: "0_evm",
      symbol: "DFI",
      symbolKey: "DFI",
      isDAT: true,
      isLPS: false,
      isLoanToken: false,
      amount: "0",
      name: "DeFiChain for EVM",
      displaySymbol: "DFI",
      avatarSymbol: "DFI",
    };
    try {
      const evmDfiBalance = utils
        .formatEther(evmWalletDetails?.coin_balance ?? "0")
        .toString();
      dfiToken.amount = evmDfiBalance;
      setEvmTokens(
        evmTokenBalances.reduce(
          (current: WalletToken[], each) => {
            const tokenAddress = each?.token?.address;
            const tokenDetails = allTokensWithAddress[tokenAddress] ?? null;
            if (tokenDetails) {
              return [
                ...current,
                {
                  id: `${tokenDetails.id}_evm`,
                  symbol: tokenDetails.symbol,
                  symbolKey: tokenDetails.symbolKey,
                  isDAT: tokenDetails.isDAT,
                  isLPS: tokenDetails.isLPS,
                  isLoanToken: tokenDetails.isLoanToken,
                  name: `${tokenDetails.name} for EVM`,
                  displaySymbol: tokenDetails.displaySymbol,
                  avatarSymbol: tokenDetails.symbol,
                  amount: utils
                    .formatUnits(each.value, each?.token?.decimals)
                    .toString(),
                },
              ];
            }
            return current;
          },
          [dfiToken],
        ),
      );
    } catch (e) {
      logger.error(e);
      setEvmTokens([dfiToken]);
    }
  };

  useEffect(() => {
    if (isFocused) {
      batch(() => {
        dispatch(
          fetchEvmWalletDetails({ evmUrl, network, evmAddress, provider }),
        );
        dispatch(
          fetchEvmTokenBalances({
            evmUrl,
            network,
            evmAddress,
            provider,
            tokenIds,
          }),
        );
      });
    }
  }, [network, evmAddress, blockCount, isFocused]);

  useEffect(() => {
    setAllTokensWithAddress(
      Object.keys(allTokens).reduce((current, each) => {
        const tokenDetails = allTokens[each];
        const key = getAddressFromDST20TokenId(tokenDetails.id);
        return Object.assign(current, { [key]: tokenDetails });
      }, {}),
    );
  }, [allTokens]);

  useEffect(() => {
    getEvmTokens();
  }, [evmWalletDetails]);

  return { evmTokens };
}
