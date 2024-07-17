import { DexPricesResult } from "@defichain/whale-api-client/dist/api/poolpairs";
import { checkValueWithinRange } from "../../../../support/utils";

const getDexPrice = (price: {
  [token: string]: string;
}): { data: DexPricesResult } => ({
  data: {
    denomination: {
      id: "3",
      symbol: "USDT",
      displaySymbol: "csUSDT",
      name: "Playground USDT",
    },
    dexPrices: {
      DUSD: {
        token: {
          id: "14",
          symbol: "DUSD",
          displaySymbol: "DUSD",
          name: "Decentralized USD",
        },
        denominationPrice: price.dusd,
      },
      USDC: {
        token: {
          id: "5",
          symbol: "USDC",
          displaySymbol: "dUSDC",
          name: "Playground USDC",
        },
        denominationPrice: price.usdc,
      },
      ETH: {
        token: {
          id: "2",
          symbol: "ETH",
          displaySymbol: "dETH",
          name: "Playground ETH",
        },
        denominationPrice: price.eth,
      },
      BTC: {
        token: {
          id: "1",
          symbol: "BTC",
          displaySymbol: "dBTC",
          name: "Playground BTC",
        },
        denominationPrice: price.btc,
      },
      DFI: {
        token: {
          id: "0",
          symbol: "DFI",
          displaySymbol: "DFI",
          name: "Default Defi token",
        },
        denominationPrice: price.dfi,
      },
    },
  },
});

const getChangingPoolPairReserve = ({
  pair1ReserveA, // BTC (BTC-DFI)
  pair1ReserveB, // DFI (BTC-DFI)
  pair2ReserveA, // USDT (USDT-DFI)
  pair2ReserveB, // DFI (USDT-DFI)
}: {
  pair1ReserveA: string;
  pair1ReserveB: string;
  pair2ReserveA: string;
  pair2ReserveB: string;
}): any => [
  {
    id: "19",
    symbol: "BTC-DFI",
    displaySymbol: "dBTC-DFI",
    name: "Playground BTC-Default Defi token",
    status: true,
    tokenA: {
      symbol: "BTC",
      displaySymbol: "dBTC",
      id: "1",
      reserve: pair1ReserveA,
      blockCommission: "0",
    },
    tokenB: {
      symbol: "DFI",
      displaySymbol: "DFI",
      id: "0",
      reserve: pair1ReserveB,
      blockCommission: "0",
    },
    priceRatio: {
      ab: "1",
      ba: "1",
    },
    commission: "0",
    totalLiquidity: {
      token: "2500",
      usd: "20000000",
    },
    tradeEnabled: true,
    ownerAddress: "mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy",
    rewardPct: "0.1",
    creation: {
      tx: "79b5f7853f55f762c7550dd7c734dff0a473898bfb5639658875833accc6d461",
      height: 132,
    },
    apr: {
      reward: 66.8826,
      total: 66.8826,
    },
  },
  {
    id: "20",
    symbol: "ETH-DFI",
    displaySymbol: "dETH-DFI",
    name: "Playground ETH-Default Defi token",
    status: true,
    tokenA: {
      symbol: "ETH",
      displaySymbol: "dETH",
      id: "2",
      reserve: "100000",
      blockCommission: "0",
    },
    tokenB: {
      symbol: "DFI",
      displaySymbol: "DFI",
      id: "0",
      reserve: "1000",
      blockCommission: "0",
    },
    priceRatio: {
      ab: "100",
      ba: "0.01",
    },
    commission: "0",
    totalLiquidity: {
      token: "10000",
      usd: "20000000",
    },
    tradeEnabled: true,
    ownerAddress: "mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy",
    rewardPct: "0.1",
    creation: {
      tx: "351c80a14f441af1c237f4abc138df242e67c8ef47cfbc1af3437798ce14bd1b",
      height: 135,
    },
    apr: {
      reward: 66.8826,
      total: 66.8826,
    },
  },
  {
    id: "21",
    symbol: "USDT-DFI",
    displaySymbol: "csUSDT-DFI",
    name: "Decentralized USD-Default Defi token",
    status: true,
    tokenA: {
      symbol: "USDT",
      displaySymbol: "csUSDT",
      id: "14",
      reserve: pair2ReserveA,
      blockCommission: "0",
    },
    tokenB: {
      symbol: "DFI",
      displaySymbol: "DFI",
      id: "0",
      reserve: pair2ReserveB,
      blockCommission: "0",
    },
    priceRatio: {
      ab: "10",
      ba: "0.1",
    },
    commission: "0.02",
    totalLiquidity: {
      token: "2500",
      usd: "16660",
    },
    tradeEnabled: true,
    ownerAddress: "mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy",
    rewardPct: "0.1",
    creation: {
      tx: "4b8d5ec122052cdb8e8ffad63865444a10edc396d44e52957758ef7a39b228fa",
      height: 147,
    },
    apr: {
      reward: 80291.23649459783,
      total: 80291.23649459783,
    },
  },
];

context("Wallet - Portfolio - USD Value", { testIsolation: false }, () => {
  const pairs = getChangingPoolPairReserve({
    pair1ReserveA: "1001",
    pair1ReserveB: "1001",
    pair2ReserveA: "8330",
    pair2ReserveB: "830",
  });

  before(() => {
    cy.intercept("**/poolpairs?size=*", {
      body: {
        data: pairs,
      },
    });
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.createEmptyWallet(true).wait(3000);
    cy.sendDFItoWallet()
      .sendTokenToWallet(["BTC", "USDT-DFI", "USDT", "ETH", "ETH-DFI"])
      .wait(10000);
  });

  it("should be able to get DEX Price USD Value", () => {
    cy.intercept("**/poolpairs/dexprices?denomination=*", {
      body: getDexPrice({
        dusd: "990.49720000",
        usdc: "1.00000000",
        eth: "10.00000000",
        btc: "10.00000000",
        dfi: "10.00000000",
      }),
    }).as("getDexPrices");
    cy.intercept("**/poolpairs?size=*", {
      body: {
        data: pairs,
      },
    }).as("getPoolPairs");
    cy.wait(["@getDexPrices", "@getPoolPairs"]).then(() => {
      cy.wait(4000);
      cy.getByTestID("dfi_total_balance_usd_amount")
        .invoke("text")
        .then((text) => {
          checkValueWithinRange(text, "100");
        });

      cy.checkBalanceRow("1", {
        name: "Playground BTC",
        amount: "10.00000000",
        displaySymbol: "dBTC",
        symbol: "BTC",
        usdAmount: "$100.00",
      });
      cy.checkBalanceRow("2", {
        name: "Playground ETH",
        amount: "10.00000000",
        displaySymbol: "dETH",
        symbol: "ETH",
        usdAmount: "$100.00",
      });
      cy.checkBalanceRow("3", {
        name: "Playground USDT",
        amount: "10.00000000",
        displaySymbol: "csUSDT",
        symbol: "USDT",
        usdAmount: "$10.00",
      });
      cy.checkBalanceRow("21", {
        name: "Playground USDT-DeFiChain",
        amount: "10.00000000",
        displaySymbol: "csUSDT-DFI",
        symbol: "USDT-DFI",
        usdAmount: "$66.52",
      });
      cy.checkBalanceRow("20", {
        name: "Playground ETH-DeFiChain",
        amount: "10.00000000",
        displaySymbol: "dETH-DFI",
        symbol: "ETH-DFI",
        usdAmount: "$1,010.00",
      });

      cy.getByTestID("total_usd_amount")
        .invoke("text")
        .then((text) => {
          checkValueWithinRange(text, "1386");
        });
    });
  });

  it("should be able to update USD Value when dex price change", () => {
    cy.intercept("**/poolpairs/dexprices?denomination=*", {
      body: getDexPrice({
        dusd: "99.49720000",
        usdc: "1.00000000",
        eth: "5.00000000",
        btc: "5.00000000",
        dfi: "5.00000000",
      }),
    }).as("getDexPrices");
    cy.intercept("**/poolpairs?size=*", {
      body: {
        data: pairs,
      },
    }).as("getPoolPairs");
    cy.wait(["@getDexPrices", "@getPoolPairs"]).then(() => {
      cy.wait(4000);
      cy.getByTestID("dfi_total_balance_usd_amount")
        .invoke("text")
        .then((text) => {
          checkValueWithinRange(text, "50.14");
        });
      cy.checkBalanceRow("1", {
        name: "Playground BTC",
        amount: "10.00000000",
        displaySymbol: "dBTC",
        symbol: "BTC",
        usdAmount: "$50.00",
      });
      cy.checkBalanceRow("2", {
        name: "Playground ETH",
        amount: "10.00000000",
        displaySymbol: "dETH",
        symbol: "ETH",
        usdAmount: "$50.00",
      });
      cy.checkBalanceRow("3", {
        name: "Playground USDT",
        amount: "10.00000000",
        displaySymbol: "csUSDT",
        symbol: "USDT",
        usdAmount: "$10.00",
      });

      cy.checkBalanceRow("21", {
        name: "Playground USDT-DeFiChain",
        amount: "10.00000000",
        displaySymbol: "csUSDT-DFI",
        symbol: "USDT-DFI",
        usdAmount: "$49.92",
      });
      cy.checkBalanceRow("20", {
        name: "Playground ETH-DeFiChain",
        amount: "10.00000000",
        displaySymbol: "dETH-DFI",
        symbol: "ETH-DFI",
        usdAmount: "$505.00",
      });

      cy.getByTestID("total_usd_amount")
        .invoke("text")
        .then((text) => {
          checkValueWithinRange(text, "714.97");
        });
    });
  });

  it("should be able to update USD Value when token is received", () => {
    cy.intercept("**/poolpairs/dexprices?denomination=*", {
      body: getDexPrice({
        dusd: "990.49720000",
        usdc: "1.00000000",
        eth: "10.00000000",
        btc: "10.00000000",
        dfi: "10.00000000",
      }),
    }).as("getDexPrices");
    cy.intercept("**/poolpairs?size=*", {
      body: {
        data: pairs,
      },
    }).as("getPoolPairs");
    cy.wait(["@getDexPrices", "@getPoolPairs"]).then(() => {
      cy.wait(4000);
      // DFI USD
      cy.getByTestID("dfi_total_balance_usd_amount")
        .invoke("text")
        .then((text) => {
          checkValueWithinRange(text, "100");
        });
      // Token USD
      cy.checkBalanceRow("1", {
        name: "Playground BTC",
        amount: "10.00000000",
        displaySymbol: "dBTC",
        symbol: "BTC",
        usdAmount: "$100.00",
      });
      cy.checkBalanceRow("2", {
        name: "Playground ETH",
        amount: "10.00000000",
        displaySymbol: "dETH",
        symbol: "ETH",
        usdAmount: "$100.00",
      });
      cy.checkBalanceRow("3", {
        name: "Playground USDT",
        amount: "10.00000000",
        displaySymbol: "csUSDT",
        symbol: "USDT",
        usdAmount: "$10.00",
      });

      // LP USD
      cy.checkBalanceRow("21", {
        name: "Playground USDT-DeFiChain",
        amount: "10.00000000",
        displaySymbol: "csUSDT-DFI",
        symbol: "USDT-DFI",
        usdAmount: "$66.52",
      });
      cy.checkBalanceRow("20", {
        name: "Playground ETH-DeFiChain",
        amount: "10.00000000",
        displaySymbol: "dETH-DFI",
        symbol: "ETH-DFI",
        usdAmount: "$1,010.00",
      });

      cy.getByTestID("total_usd_amount")
        .invoke("text")
        .then((text) => {
          checkValueWithinRange(text, "1386.66", 1);
        });

      // update token balance
      cy.sendTokenToWallet(["BTC", "USDT-DFI", "USDT", "ETH-DFI"]);
      cy.wait(3000);

      // DFI USD
      cy.getByTestID("dfi_total_balance_usd_amount")
        .invoke("text")
        .then((text) => {
          checkValueWithinRange(text, "100", 1);
        });

      // Token USD
      cy.checkBalanceRow("1", {
        name: "Playground BTC",
        amount: "20.00000000",
        displaySymbol: "dBTC",
        symbol: "BTC",
        usdAmount: "$200.00",
      });
      cy.checkBalanceRow("2", {
        name: "Playground ETH",
        amount: "10.00000000",
        displaySymbol: "dETH",
        symbol: "ETH",
        usdAmount: "$100.00",
      });
      cy.checkBalanceRow("3", {
        name: "Playground USDT",
        amount: "20.00000000",
        displaySymbol: "csUSDT",
        symbol: "USDT",
        usdAmount: "$20.00",
      });

      // LP USD
      cy.checkBalanceRow("21", {
        name: "Playground USDT-DeFiChain",
        amount: "20.00000000",
        displaySymbol: "csUSDT-DFI",
        symbol: "USDT-DFI",
        usdAmount: "$133.04",
      });
      cy.checkBalanceRow("20", {
        name: "Playground ETH-DeFiChain",
        amount: "20.00000000",
        displaySymbol: "dETH-DFI",
        symbol: "ETH-DFI",
        usdAmount: "$2,020.00",
      });

      cy.getByTestID("total_usd_amount")
        .invoke("text")
        .then((text) => {
          checkValueWithinRange(text, "2573");
        });
    });
  });

  it("should be able to update USD Value when DFI is received", () => {
    cy.intercept("**/poolpairs/dexprices?denomination=*", {
      body: getDexPrice({
        dusd: "990.49720000",
        usdc: "1.00000000",
        eth: "10.00000000",
        btc: "10.00000000",
        dfi: "10.00000000",
      }),
    }).as("getDexPrices");
    cy.intercept("**/poolpairs?size=*", {
      body: {
        data: pairs,
      },
    }).as("getPoolPairs");
    cy.wait(["@getDexPrices", "@getPoolPairs"]).then(() => {
      cy.wait(4000);
      cy.sendDFItoWallet().wait(5000);
      cy.getByTestID("dfi_total_balance_amount")
        .invoke("text")
        .then((text) => {
          checkValueWithinRange(text, "20");
        });
      cy.getByTestID("dfi_total_balance_usd_amount")
        .invoke("text")
        .then((text) => {
          checkValueWithinRange(text, "200");
        });
      cy.getByTestID("total_usd_amount")
        .invoke("text")
        .then((text) => {
          checkValueWithinRange(text, "2673");
        });
    });
  });
});

// TO calculate usd value
// const getUsdAmount = (symbol: string, amount: string) : GetUSDAmountI => {
//   const poolPairData = pairs.find(
//     (pr) => pr?.symbol === symbol,
//   );
//   const toRemove = new BigNumber(1)
//     .times(amount)
//     .decimalPlaces(8, BigNumber.ROUND_DOWN);
//   const ratioToTotal = toRemove.div(poolPairData?.totalLiquidity?.token ?? 1);
//   const tokenATotal = ratioToTotal
//     .times(poolPairData?.tokenA.reserve ?? 0)
//     .decimalPlaces(8, BigNumber.ROUND_DOWN);
//   const tokenBTotal = ratioToTotal
//     .times(poolPairData?.tokenB.reserve ?? 0)
//     .decimalPlaces(8, BigNumber.ROUND_DOWN);
//   return { tokenATotal, tokenBTotal }
// }
