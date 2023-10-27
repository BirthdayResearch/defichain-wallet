import { useSelector } from "react-redux";
import BigNumber from "bignumber.js";
import { RootState } from "@store";
import { WalletToken, tokensSelector } from "@waveshq/walletkit-ui/dist/store";
import { useMemo } from "react";
import { DomainType } from "@contexts/DomainContext";
import { useEvmTokenBalances } from "./EvmTokenBalances";

export interface DomainToken {
  tokenId: string;
  available: BigNumber;
  token: {
    name: string;
    displaySymbol: string;
    displayTextSymbol: string;
    symbol: string;
    isLPS?: boolean;
    domainType: DomainType;
  };
  factor?: string;
  reserve?: string;
}

export function useTokenBalance(): {
  dvmTokens: DomainToken[];
  evmTokens: DomainToken[];
} {
  const tokens = useSelector((state: RootState) =>
    tokensSelector(state.wallet),
  );

  const { evmTokens } = useEvmTokenBalances();
  const mapDomainToken = (token: WalletToken) => {
    return {
      tokenId: token.id,
      available: new BigNumber(token.amount),
      token: {
        name: token.name,
        displaySymbol: token.displaySymbol,
        displayTextSymbol: token.displaySymbol,
        symbol: token.symbol,
        isLPS: token.isLPS,
        domainType: DomainType.EVM,
      },
    };
  };
  const { dvmTokens } = useMemo(() => {
    return tokens.reduce(
      (
        { dvmTokens }: { dvmTokens: DomainToken[] },
        token,
      ): { dvmTokens: DomainToken[] } => {
        if (token.isLPS || token.id === "0_unified") {
          return { dvmTokens };
        }

        return {
          dvmTokens: [
            ...dvmTokens,
            {
              tokenId: token.id,
              available: getConvertibleAmount(
                token.id === "0_utxo",
                new BigNumber(token.amount),
              ),
              token: {
                name: token.name,
                displaySymbol: token.displaySymbol,
                displayTextSymbol:
                  token.id === "0"
                    ? "DFI"
                    : token.id === "0_utxo"
                    ? "UTXO"
                    : token.displaySymbol,
                symbol: token.symbol,
                isLPS: false,
                domainType: DomainType.DVM,
              },
            },
          ],
        };
      },
      {
        dvmTokens: [],
      },
    );
  }, [tokens]);

  return {
    dvmTokens,
    evmTokens: evmTokens.map(mapDomainToken),
  };
}

function getConvertibleAmount(isUtxo: boolean, amount: BigNumber): BigNumber {
  if (isUtxo) {
    const utxoToReserve = "0.1";
    const leftover = new BigNumber(amount).minus(new BigNumber(utxoToReserve));
    return leftover.isLessThan(0) ? new BigNumber(0) : leftover;
  }

  return amount;
}
