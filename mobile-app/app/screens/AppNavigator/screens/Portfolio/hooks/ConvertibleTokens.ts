import { useSelector } from "react-redux";
import BigNumber from "bignumber.js";
import { RootState } from "@store";
import {
  DFITokenSelector,
  DFIUtxoSelector,
} from "@waveshq/walletkit-ui/dist/store";

interface ConvertibleToken {
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

export function useConvertibleTokens(): {
  fromTokens: ConvertibleToken[];
} {
  const DFIUtxo = useSelector((state: RootState) =>
    DFIUtxoSelector(state.wallet)
  );
  const DFIToken = useSelector((state: RootState) =>
    DFITokenSelector(state.wallet)
  );

  const fromTokens: ConvertibleToken[] = [
    {
      tokenId: DFIToken.id,
      available: new BigNumber(DFIToken.amount),
      token: {
        name: DFIToken.name,
        displaySymbol: DFIToken.displaySymbol,
        symbol: DFIToken.symbol,
        isLPS: false,
      },
    },
    {
      tokenId: DFIUtxo.id,
      available: new BigNumber(DFIUtxo.amount),
      token: {
        name: DFIUtxo.name,
        displaySymbol: DFIUtxo.displaySymbol,
        symbol: DFIUtxo.symbol,
        isLPS: false,
      },
    },
  ];

  return {
    fromTokens,
  };
}
