export const mockedStatsData = {
  count: {
    blocks: 2860706,
    prices: 145,
    tokens: 221,
    masternodes: 15044,
  },
  burned: {
    address: 156047252.270101,
    fee: 315015.5,
    auction: 1512527.37726055,
    payback: 61705058.1749106,
    emission: 98783549.5707572,
    total: 317634155.7199576,
  },
  tvl: {
    dex: 272281685.3262795,
    masternodes: 152862005.47177258,
    loan: 181660513.6278827,
    total: 606804204.4259348,
  },
  price: {
    usd: 0.4935809023951326,
    usdt: 0.4935809023951326,
  },
  masternodes: {
    locked: [
      {
        weeks: 0,
        count: 10636,
        tvl: 109372690.57990181,
      },
      {
        weeks: 520,
        count: 3491,
        tvl: 34469627.40944635,
      },
      {
        weeks: 260,
        count: 917,
        tvl: 9054324.931097768,
      },
    ],
  },
  loan: {
    count: {
      collateralTokens: 7,
      loanTokens: 56,
      openAuctions: 1,
      openVaults: 11424,
      schemes: 6,
    },
    value: {
      collateral: 181011671.8179531,
      loan: 84857375.19502015,
    },
  },
  emission: {
    masternode: 49.50800321,
    dex: 37.80314077,
    community: 7.2932582,
    anchor: 0.02970777,
    burned: 53.904753576004445,
    total: 148.53886352600443,
  },
  net: {
    version: 3020800,
    subversion: "/DeFiChain:3.2.8/",
    protocolversion: 70036,
  },
  blockchain: {
    difficulty: 40436424028.63132,
  },
};

export const mockedPoolPairData = [
  {
    id: "4",
    symbol: "ETH-DFI",
    displaySymbol: "dETH-DFI",
    name: "Ether-Default Defi token",
    status: true,
    tokenA: {
      symbol: "ETH",
      displaySymbol: "dETH",
      id: "1",
      name: "Ether",
      reserve: "6084.54409371",
      blockCommission: "0",
    },
    tokenB: {
      symbol: "DFI",
      displaySymbol: "DFI",
      id: "0",
      name: "Default Defi token",
      reserve: "24609913.43738302",
      blockCommission: "0",
    },
    priceRatio: {
      ab: "0.00024723",
      ba: "4044.66021748",
    },
    commission: "0.002",
    totalLiquidity: {
      token: "386541.57956427",
      usd: "25636863.24062524435653579327168029",
    },
    tradeEnabled: true,
    ownerAddress: "8UAhRuUFCyFUHEPD7qvtj8Zy2HxF5HH5nb",
    rewardPct: "0.13086",
    rewardLoanPct: "0",
    creation: {
      tx: "9827894c083b77938d13884f0404539daa054a818e0c5019afa1eeff0437a51b",
      height: 466822,
    },
    apr: {
      reward: 0.10565257112251523,
      commission: 0.006194303259455489,
      total: 0.11184687438197073,
    },
    volume: {
      h24: 12000,
      d30: 9384652.670150768,
    },
  },
  {
    id: "5",
    symbol: "BTC-DFI",
    displaySymbol: "dBTC-DFI",
    name: "Bitcoin-Default Defi token",
    status: true,
    tokenA: {
      symbol: "BTC",
      displaySymbol: "dBTC",
      id: "2",
      name: "Bitcoin",
      reserve: "1906.53033325",
      blockCommission: "0",
      fee: {
        pct: "0.001",
        inPct: "0.001",
        outPct: "0.001",
      },
    },
    tokenB: {
      symbol: "DFI",
      displaySymbol: "DFI",
      id: "0",
      name: "Default Defi token",
      reserve: "110882651.06540145",
      blockCommission: "0",
    },
    priceRatio: {
      ab: "0.00001719",
      ba: "58159.39517541",
    },
    commission: "0.002",
    totalLiquidity: {
      token: "459594.97245415",
      usd: "115509685.491358337662696092943679775",
    },
    tradeEnabled: true,
    ownerAddress: "8UAhRuUFCyFUHEPD7qvtj8Zy2HxF5HH5nb",
    rewardPct: "0.67383",
    rewardLoanPct: "0",
    creation: {
      tx: "f3c99e199d0157b2b6254cf3a51bb1171569ad5c4beb797e957d245aec194d38",
      height: 466826,
    },
    apr: {
      reward: 0.12074522976211577,
      commission: 0.004496521422034606,
      total: 0.12524175118415037,
    },
    volume: {
      h24: 12001,
      d30: 20157262.644748364,
    },
  },
  {
    id: "6",
    symbol: "USDT-DFI",
    displaySymbol: "dUSDT-DFI",
    name: "Tether USD-Default Defi token",
    status: true,
    tokenA: {
      symbol: "USDT",
      displaySymbol: "dUSDT",
      id: "3",
      name: "Tether USD",
      reserve: "2840795.72929717",
      blockCommission: "0",
    },
    tokenB: {
      symbol: "DFI",
      displaySymbol: "DFI",
      id: "0",
      name: "Default Defi token",
      reserve: "5453921.39411839",
      blockCommission: "0",
    },
    priceRatio: {
      ab: "0.52087214",
      ba: "1.91985693",
    },
    commission: "0.002",
    totalLiquidity: {
      token: "3908049.73263869",
      usd: "5681591.45859434",
    },
    tradeEnabled: true,
    ownerAddress: "8UAhRuUFCyFUHEPD7qvtj8Zy2HxF5HH5nb",
    rewardPct: "0.02909",
    rewardLoanPct: "0",
    creation: {
      tx: "37939243c7dbacb2675cfc4e0632e9bf829dcc5cece2928f235fba4b03c09a6a",
      height: 466826,
    },
    apr: {
      reward: 0.1059770338938296,
      commission: 0.0159031293880106,
      total: 0.1218801632818402,
    },
    volume: {
      h24: 12002,
      d30: 11394557.050918248,
    },
  },
  {
    id: "8",
    symbol: "DOGE-DFI",
    displaySymbol: "dDOGE-DFI",
    name: "Dogecoin-Default Defi token",
    status: true,
    tokenA: {
      symbol: "DOGE",
      displaySymbol: "dDOGE",
      id: "7",
      name: "Dogecoin",
      reserve: "2238975.88572023",
      blockCommission: "0",
    },
    tokenB: {
      symbol: "DFI",
      displaySymbol: "DFI",
      id: "0",
      name: "Default Defi token",
      reserve: "400276.86840847",
      blockCommission: "0",
    },
    priceRatio: {
      ab: "5.593568",
      ba: "0.17877676",
    },
    commission: "0.002",
    totalLiquidity: {
      token: "931088.8215018",
      usd: "416980.066178766746375664018708065",
    },
    tradeEnabled: true,
    ownerAddress: "8UAhRuUFCyFUHEPD7qvtj8Zy2HxF5HH5nb",
    rewardPct: "0",
    rewardLoanPct: "0",
    creation: {
      tx: "9e0c956f9c626c07ba3dd742748ff9872b5688a976d66d35aa09418f18620b64",
      height: 607452,
    },
    apr: {
      reward: 0,
      commission: 0.013596317989663933,
      total: 0.013596317989663933,
    },
    volume: {
      h24: 12003,
      d30: 711633.5942259821,
    },
  },
  {
    id: "10",
    symbol: "LTC-DFI",
    displaySymbol: "dLTC-DFI",
    name: "Litecoin-Default Defi token",
    status: true,
    tokenA: {
      symbol: "LTC",
      displaySymbol: "dLTC",
      id: "9",
      name: "Litecoin",
      reserve: "11904.19924637",
      blockCommission: "0",
    },
    tokenB: {
      symbol: "DFI",
      displaySymbol: "DFI",
      id: "0",
      name: "Default Defi token",
      reserve: "2317337.42661253",
      blockCommission: "0",
    },
    priceRatio: {
      ab: "0.00513701",
      ba: "194.66554437",
    },
    commission: "0.002",
    totalLiquidity: {
      token: "162557.66984317",
      usd: "2414037.856720123393447225830671435",
    },
    tradeEnabled: true,
    ownerAddress: "8UAhRuUFCyFUHEPD7qvtj8Zy2HxF5HH5nb",
    rewardPct: "0",
    rewardLoanPct: "0",
    creation: {
      tx: "75a25a52c54d12f84d4a553be354fa2c5651689d8f9f4860aad8b68c804af3f1",
      height: 614026,
    },
    apr: {
      reward: 0,
      commission: 0.00819656242847228,
      total: 0.00819656242847228,
    },
    volume: {
      h24: 12004,
      d30: 2089677.4183758958,
    },
  },
];

export const mockedDexPricesData = {
  denomination: {
    id: "3",
    name: "Tether USD",
    symbol: "USDT",
    displaySymbol: "dUSDT",
  },
  dexPrices: {
    DFI: {
      token: {
        id: "0",
        name: "Default Defi token",
        symbol: "DFI",
        displaySymbol: "DFI",
      },
      denominationPrice: "0.51229009",
    },
    ETH: {
      token: {
        id: "1",
        name: "Ether",
        symbol: "ETH",
        displaySymbol: "dETH",
      },
      denominationPrice: "2126.78379968",
    },
    BTC: {
      token: {
        id: "2",
        name: "Bitcoin",
        symbol: "BTC",
        displaySymbol: "dBTC",
      },
      denominationPrice: "30022.91758081",
    },
    DOGE: {
      token: {
        id: "7",
        name: "Dogecoin",
        symbol: "DOGE",
        displaySymbol: "dDOGE",
      },
      denominationPrice: "0.09458052",
    },
    LTC: {
      token: {
        id: "9",
        name: "Litecoin",
        symbol: "LTC",
        displaySymbol: "dLTC",
      },
      denominationPrice: "103.65046666",
    },
    USDC: {
      token: {
        id: "13",
        name: "USD Coin",
        symbol: "USDC",
        displaySymbol: "dUSDC",
      },
      denominationPrice: "1.01551234",
    },
  },
};

// generated fixtures from mocked data above
export const expectedPairData = {
  "dETH-DFI": {
    primaryTokenPrice: "2072.0393468322487732",
    volume24H: "12000",
    totalLiquidity: "25636863.24062524435653579327168029",
    apr: "0.11184687438197073",
  },
  "dBTC-DFI": {
    primaryTokenPrice: "29794.4817887563546869",
    volume24H: "12001",
    totalLiquidity: "115509685.491358337662696092943679775",
    apr: "0.12524175118415037",
  },
  "dUSDT-DFI": {
    primaryTokenPrice: "0.9835236794568237",
    volume24H: "12002",
    totalLiquidity: "5681591.45859434",
    apr: "0.1218801632818402",
  },
  "dDOGE-DFI": {
    primaryTokenPrice: "0.0915855624703084",
    volume24H: "12003",
    totalLiquidity: "416980.066178766746375664018708065",
    apr: "0.013596317989663933",
  },
  "dLTC-DFI": {
    primaryTokenPrice: "99.7252292452062933",
    volume24H: "12004",
    totalLiquidity: "2414037.856720123393447225830671435",
    apr: "0.00819656242847228",
  },
};
