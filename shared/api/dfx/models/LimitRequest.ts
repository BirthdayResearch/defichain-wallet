export enum Limit {
  K_500 = 500000,
  M_1 = 1000000,
  M_5 = 5000000,
  M_10 = 10000000,
  M_15 = 15000000,
  INFINITY = 1000000000,
}

export enum InvestmentDate {
  NOW = 'Now',
  FUTURE = 'Future',
}

export enum FundOrigin {
  SAVINGS = 'Savings',
  BUSINESS_PROFITS = 'BusinessProfits',
  STOCK_GAINS = 'StockGains',
  CRYPTO_GAINS = 'CryptoGains',
  INHERITANCE = 'Inheritance',
  OTHER = 'Other',
}

export interface LimitRequest {
  limit: Limit
  investmentDate: InvestmentDate
  fundOrigin: FundOrigin
  fundOriginText?: string
  documentProof?: string
  documentProofName?: string
}
