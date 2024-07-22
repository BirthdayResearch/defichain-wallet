const updated_dusdt_name = "ex_USDT";

export function dusdt_converter_token(token: any) {
  return {
    ...token,
    displaySymbol: token.displaySymbol.replace(/dUSDT/g, updated_dusdt_name),
    displayTextSymbol: token.displaySymbol.replace(
      /dUSDT/g,
      updated_dusdt_name,
    ),
    name: token.name.replace(/dUSDT/g, updated_dusdt_name),
  };
}

export function dusdt_converter_pool_pair(availablePairs: any) {
  if (availablePairs.length > 1) {
    return availablePairs.map((pair: any) => {
      return {
        ...pair,
        data: {
          ...pair.data,
          symbol: pair.data.symbol.replace(/dUSDT/g, updated_dusdt_name),
          displaySymbol: pair.data.displaySymbol.replace(
            /dUSDT/g,
            updated_dusdt_name,
          ),
          name: pair.data.name.replace(/USDT/g, updated_dusdt_name),
          tokenA: {
            ...pair.data.tokenA,
            symbol:
              pair.data.tokenA.symbol === "dUSDT"
                ? updated_dusdt_name
                : pair.data.tokenA.symbol,
            displaySymbol:
              pair.data.tokenA.displaySymbol === "dUSDT"
                ? updated_dusdt_name
                : pair.data.tokenA.displaySymbol,
          },
          tokenB: {
            ...pair.data.tokenB,
            symbol:
              pair.data.tokenB.symbol === "dUSDT"
                ? updated_dusdt_name
                : pair.data.tokenB.symbol,
            displaySymbol:
              pair.data.tokenB.displaySymbol === "dUSDT"
                ? updated_dusdt_name
                : pair.data.tokenB.displaySymbol,
          },
        },
      };
    });
  } else {
    return {
      ...availablePairs,
      data: {
        ...availablePairs.data,
        symbol: availablePairs.data.symbol.replace(
          /dUSDT/g,
          updated_dusdt_name,
        ),
        displaySymbol: availablePairs.data.displaySymbol.replace(
          /dUSDT/g,
          updated_dusdt_name,
        ),
        name: availablePairs.data.name.replace(/USDT/g, updated_dusdt_name),
        tokenA: {
          ...availablePairs.data.tokenA,
          symbol:
            availablePairs.data.tokenA.symbol === "dUSDT"
              ? updated_dusdt_name
              : availablePairs.data.tokenA.symbol,
          displaySymbol:
            availablePairs.data.tokenA.displaySymbol === "dUSDT"
              ? updated_dusdt_name
              : availablePairs.data.tokenA.displaySymbol,
        },
        tokenB: {
          ...availablePairs.data.tokenB,
          symbol:
            availablePairs.data.tokenB.symbol === "dUSDT"
              ? updated_dusdt_name
              : availablePairs.data.tokenB.symbol,
          displaySymbol:
            availablePairs.data.tokenB.displaySymbol === "dUSDT"
              ? updated_dusdt_name
              : availablePairs.data.tokenB.displaySymbol,
        },
      },
    };
  }
}
