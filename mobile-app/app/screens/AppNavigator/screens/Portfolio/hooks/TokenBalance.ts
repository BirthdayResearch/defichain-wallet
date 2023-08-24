import { useSelector } from "react-redux";
import BigNumber from "bignumber.js";
import { RootState } from "@store";
import {
  dexPricesSelectorByDenomination,
  tokensSelector,
} from "@waveshq/walletkit-ui/dist/store";
import { useMemo } from "react";
import { DomainType } from "@contexts/DomainContext";
import { useDenominationCurrency } from "./PortfolioCurrency";

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
  const { denominationCurrency } = useDenominationCurrency();

  const tokens = useSelector((state: RootState) =>
    tokensSelector(state.wallet),
  );
  const prices = useSelector((state: RootState) =>
    dexPricesSelectorByDenomination(state.wallet, denominationCurrency),
  );

  const { dvmTokens, evmTokens } = useMemo(() => {
    return tokens.reduce(
      (
        {
          dvmTokens,
          evmTokens,
        }: { dvmTokens: DomainToken[]; evmTokens: DomainToken[] },
        token,
      ): { dvmTokens: DomainToken[]; evmTokens: DomainToken[] } => {
        if (token.isLPS || token.id === "0_unified") {
          return { dvmTokens, evmTokens };
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
          // TODO: Update balance and use a separate useMemo since it has different source
          evmTokens: [
            ...evmTokens,
            {
              tokenId: `${token.id}-EVM`,
              available: new BigNumber(token.amount).plus(69),
              token: {
                name: `${token.name} for EVM`,
                displaySymbol: token.displaySymbol,
                displayTextSymbol:
                  token.symbol === "DFI" ? "DFI" : token.displaySymbol,
                symbol: token.symbol,
                isLPS: false,
                domainType: DomainType.EVM,
              },
            },
          ],
        };
      },
      {
        dvmTokens: [],
        evmTokens: [],
      },
    );
  }, [prices, tokens]);

  return {
    dvmTokens,
    // TODO(pierregee): remove this. temp added for testing
    evmTokens: evmTokens.filter((token) => token.tokenId !== "0_utxo-EVM"),
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
