export function dusdt_converter_token(token: any) {
  if (token.displayTextSymbol) {
    return { ...token, displaySymbol: "csUSDT", displayTextSymbol: "csUSDT" };
  }
  return { ...token, displaySymbol: "csUSDT" };
}

export function dusdt_converter_pool_pair(availablePairs: any) {
  if (availablePairs.length > 1) {
    return availablePairs.map((pair: any) => {
      const updatedPair = {
        ...pair,
        data: {
          ...pair.data,
          symbol: pair.data.symbol.replace(/dUSDT/g, "csUSDT"),
          displaySymbol: pair.data.displaySymbol.replace(/dUSDT/g, "csUSDT"),
          tokenA: {
            ...pair.data.tokenA,
            symbol:
              pair.data.tokenA.symbol === "dUSDT"
                ? "csUSDT"
                : pair.data.tokenA.symbol,
            displaySymbol:
              pair.data.tokenA.displaySymbol === "dUSDT"
                ? "csUSDT"
                : pair.data.tokenA.displaySymbol,
          },
          tokenB: {
            ...pair.data.tokenB,
            symbol:
              pair.data.tokenB.symbol === "dUSDT"
                ? "csUSDT"
                : pair.data.tokenB.symbol,
            displaySymbol:
              pair.data.tokenB.displaySymbol === "dUSDT"
                ? "csUSDT"
                : pair.data.tokenB.displaySymbol,
          },
        },
      };
      return updatedPair;
    });
  } else {
    return {
      ...availablePairs,
      data: {
        ...availablePairs.data,
        symbol: availablePairs.data.symbol.replace(/dUSDT/g, "csUSDT"),
        displaySymbol: availablePairs.data.displaySymbol.replace(
          /dUSDT/g,
          "csUSDT",
        ),
        tokenA: {
          ...availablePairs.data.tokenA,
          symbol:
            availablePairs.data.tokenA.symbol === "dUSDT"
              ? "csUSDT"
              : availablePairs.data.tokenA.symbol,
          displaySymbol:
            availablePairs.data.tokenA.displaySymbol === "dUSDT"
              ? "csUSDT"
              : availablePairs.data.tokenA.displaySymbol,
        },
        tokenB: {
          ...availablePairs.data.tokenB,
          symbol:
            availablePairs.data.tokenB.symbol === "dUSDT"
              ? "csUSDT"
              : availablePairs.data.tokenB.symbol,
          displaySymbol:
            availablePairs.data.tokenB.displaySymbol === "dUSDT"
              ? "csUSDT"
              : availablePairs.data.tokenB.displaySymbol,
        },
      },
    };
  }
}
