import { useSelector } from "react-redux";
import BigNumber from "bignumber.js";
import { RootState } from "@store";
import {
  dexPricesSelectorByDenomination,
  tokensSelector,
} from "@waveshq/walletkit-ui/dist/store";
import { useMemo } from "react";
import { useDenominationCurrency } from "./PortfolioCurrency";

export interface FromToken {
  tokenId: string;
  available: BigNumber;
  token: {
    name: string;
    displaySymbol: string;
    symbol: string;
    isLPS?: boolean;
  };
  factor?: string;
  reserve?: string;
}

export function useTokenBalance(): {
  dvmTokens: FromToken[];
  evmTokens: FromToken[];
} {
  const { denominationCurrency } = useDenominationCurrency();

  const tokens = useSelector((state: RootState) =>
    tokensSelector(state.wallet)
  );
  const prices = useSelector((state: RootState) =>
    dexPricesSelectorByDenomination(state.wallet, denominationCurrency)
  );

  const { dvmTokens, evmTokens } = useMemo(() => {
    return tokens.reduce(
      (
        {
          dvmTokens,
          evmTokens,
        }: { dvmTokens: FromToken[]; evmTokens: FromToken[] },
        token
      ): { dvmTokens: FromToken[]; evmTokens: FromToken[] } => {
        if (token.isLPS || token.id === "0_unified") {
          return { dvmTokens, evmTokens };
        }

        return {
          dvmTokens: [
            ...dvmTokens,
            {
              tokenId: token.id,
              available: new BigNumber(token.amount),
              token: {
                name: token.name,
                displaySymbol: token.displaySymbol,
                symbol: token.symbol,
                isLPS: false,
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
                symbol: token.symbol,
                isLPS: false,
              },
            },
          ],
        };
      },
      {
        dvmTokens: [],
        evmTokens: [],
      }
    );
  }, [prices, tokens]);

  return {
    dvmTokens,
    evmTokens,
  };
}
