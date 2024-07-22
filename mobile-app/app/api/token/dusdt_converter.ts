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

export function dusdt_converter_pair_data(pairData: any) {
  return {
    ...pairData,
    symbol: pairData.symbol.replace(/USDT/g, updated_dusdt_name),
    displaySymbol: pairData.displaySymbol.replace(/dUSDT/g, updated_dusdt_name),
    name: pairData.name.replace(/USDT/g, updated_dusdt_name),
    tokenA: {
      ...pairData.tokenA,
      symbol:
        pairData.tokenA.symbol === "dUSDT"
          ? updated_dusdt_name
          : pairData.tokenA.symbol,
      displaySymbol:
        pairData.tokenA.displaySymbol === "dUSDT"
          ? updated_dusdt_name
          : pairData.tokenA.displaySymbol,
    },
    tokenB: {
      ...pairData.tokenB,
      symbol:
        pairData.tokenB.symbol === "dUSDT"
          ? updated_dusdt_name
          : pairData.tokenB.symbol,
      displaySymbol:
        pairData.tokenB.displaySymbol === "dUSDT"
          ? updated_dusdt_name
          : pairData.tokenB.displaySymbol,
    },
  };
}

export function dusdt_converter_auction(auctionData: any) {
  return auctionData.map((auction: any) => {
    return {
      ...auction,
      collateralTokenSymbols: auction.collateralTokenSymbols.map(
        (symbol: string) => symbol.replace(/dUSDT/g, updated_dusdt_name),
      ),
      collaterals: auction.collaterals.map((collateral: any) => ({
        ...collateral,
        name: collateral.name.replace(/USDT/g, updated_dusdt_name),
        displaySymbol: collateral.displaySymbol.replace(
          /dUSDT/g,
          updated_dusdt_name,
        ),
      })),
      loan: {
        ...auction.loan,
        name: auction.loan.name.replace(/USDT/g, updated_dusdt_name),
        displaySymbol: auction.loan.displaySymbol.replace(
          /dUSDT/g,
          updated_dusdt_name,
        ),
      },
      auction: {
        ...auction.auction,
        batches: auction.auction.batches.map((batch: any) => ({
          ...batch,
          collaterals: batch.collaterals.map((collateral: any) => ({
            ...collateral,
            name: collateral.name.replace(/USDT/g, updated_dusdt_name),
            displaySymbol: collateral.displaySymbol.replace(
              /dUSDT/g,
              updated_dusdt_name,
            ),
          })),
          loan: {
            ...batch.loan,
            name: batch.loan.name.replace(/USDT/g, updated_dusdt_name),
            displaySymbol: batch.loan.displaySymbol.replace(
              /dUSDT/g,
              updated_dusdt_name,
            ),
          },
        })),
      },
    };
  });
}
