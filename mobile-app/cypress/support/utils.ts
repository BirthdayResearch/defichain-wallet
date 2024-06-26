import BigNumber from "bignumber.js";

export function generateBlockUntilLiquidate(): void {
  cy.getByTestID("playground_generate_blocks").click();
  cy.wait(3000);
  cy.getByTestID("vault_card_0_status")
    .invoke("text")
    .then((status: string) => {
      if (status !== "IN LIQUIDATION") {
        generateBlockUntilLiquidate();
      }
    });
}

export function checkValueWithinRange(
  actualVal: string,
  expectedVal: string,
  range: number = 2,
): void {
  const value = new BigNumber(actualVal.replace(/[≈$,%()K]/gi, "").trim());
  const expectedValue = new BigNumber(
    expectedVal.replace(/[≈$,%()K]/gi, "").trim(),
  );
  expect(
    value.gte(expectedValue.minus(range)),
    `${value.toFixed(8)} should be gte ${expectedValue.minus(range).toFixed(8)}`,
  ).to.be.eq(true);
  expect(
    value.lte(expectedValue.plus(range)),
    `${value.toFixed(8)} should be lte ${expectedValue.plus(range).toFixed(8)}`,
  ).to.be.eq(true);
}

export function checkCollateralFormValues(
  title: string,
  symbol: string,
  balance: string,
): void {
  cy.getByTestID("add_remove_title").contains(title);
  cy.getByTestID(
    "token_select_button_add_remove_collateral_quick_input_display_symbol",
  ).contains(symbol);
  cy.getByTestID("add_remove_collateral_token_balance").contains(balance);
}

export function checkConfirmEditCollateralValues(
  title: string,
  vaultId: string,
  colFactor: string,
  symbol: string,
  amount: string,
  colValue: string,
  vaultShare: string,
): void {
  cy.getByTestID("confirm_title").contains(title);
  cy.getByTestID("text_confirm_edit_collateral_amount").contains(amount);
  cy.getByTestID("confirm_edit_vault_id").contains(vaultId);
  cy.getByTestID("confirm_edit_collateral_factor").contains(colFactor);
  cy.getByTestID("confirm_edit_collateral_amount").contains(
    `${amount} ${symbol}`,
  );
  cy.getByTestID("confirm_edit_collateral_amount_rhsUsdAmount").contains(
    colValue,
  );
  cy.getByTestID("confirm_edit_vault_share")
    .invoke("text")
    .then((val) => {
      checkValueWithinRange(val, vaultShare, 0.1);
    });
}

export function checkVaultDetailValues(
  vaultID: string,
  totalCollateral: string,
  maxLoanAmount: string,
  totalLoans: string,
  vaultInterest: string,
  minColRatio: string,
  status?: string,
  vaultRatio?: string,
): void {
  if (status !== undefined) {
    cy.getByTestID("vault_status").contains(status);
  }
  if (vaultRatio !== undefined) {
    cy.getByTestID("vault_ratio")
      .invoke("text")
      .then((val) => {
        checkValueWithinRange(val, vaultRatio, 0.1);
      });
  }
  cy.getByTestID("collateral_vault_id").contains(vaultID);
  cy.getByTestID("total_collateral").contains(totalCollateral);
  cy.getByTestID("max_loan_amount")
    .invoke("text")
    .then((val) => {
      checkValueWithinRange(val, maxLoanAmount, 0.1);
    });
  cy.getByTestID("total_loan").contains(totalLoans);
  cy.getByTestID("interest").contains(vaultInterest);
  cy.getByTestID("min_col_ratio").contains(minColRatio);
  // Vault detail labels
  cy.getByTestID("collateral_vault_id_label").contains("Vault ID");
  cy.getByTestID("total_collateral_label").contains("Total collateral");
  cy.getByTestID("max_loan_amount_label").contains("Max loan amount");
  cy.getByTestID("total_loan_label").contains("Total loan");
  cy.getByTestID("interest_label").contains("Interest (APR)");
  cy.getByTestID("min_col_ratio_label").contains("Min. collateral ratio");
}

export function checkVaultDetailCollateralAmounts(
  symbol: string,
  amount: string,
  dollarValue: string,
  vaultShare: string,
): void {
  cy.getByTestID(`vault_detail_collateral_${symbol}_amount`).contains(amount);
  cy.getByTestID(`vault_detail_collateral_${symbol}_usd`).contains(dollarValue);
  cy.getByTestID(`vault_detail_collateral_${symbol}_vault_share`)
    .invoke("text")
    .then((val) => {
      checkValueWithinRange(val, vaultShare, 0.1);
    });
}

export function checkVaultDetailLoansAmount(
  amount: string,
  displaySymbol: string,
  interest: string,
) {
  cy.getByTestID(`loan_card_${displaySymbol}`).should("exist");
  cy.getByTestID(`loan_card_${displaySymbol}_amount`).contains(amount);
  cy.getByTestID(`loan_card_${displaySymbol}_interest`).contains(interest);
}

export const samplePoolPair = [
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
      name: "Playground BTC",
      reserve: "1000",
      blockCommission: "0",
    },
    tokenB: {
      symbol: "DFI",
      displaySymbol: "DFI",
      id: "0",
      name: "Default Defi token",
      reserve: "1000",
      blockCommission: "0",
    },
    priceRatio: {
      ab: "1",
      ba: "1",
    },
    commission: "0",
    totalLiquidity: {
      token: "1000",
      usd: "20000000",
    },
    tradeEnabled: true,
    ownerAddress: "mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy",
    rewardPct: "0.05882352",
    rewardLoanPct: "0",
    creation: {
      tx: "47f35e7b540fbc920a69fdc9ae13165769f1fdc23cdfad150ee74dbf0bc545e7",
      height: 141,
    },
    apr: {
      reward: 39.34269958752,
      commission: 0,
      total: 39.34269958752,
    },
    volume: {
      h24: 0,
      d30: 0,
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
      name: "Playground ETH",
      reserve: "100000",
      blockCommission: "0",
    },
    tokenB: {
      symbol: "DFI",
      displaySymbol: "DFI",
      id: "0",
      name: "Default Defi token",
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
    rewardPct: "0.05882353",
    rewardLoanPct: "0",
    creation: {
      tx: "56e0b30c535d705f1644d8ff567df34157d21b52bde9555b0715acc4fc9d4c56",
      height: 144,
    },
    apr: {
      reward: 39.34270627578,
      commission: 0,
      total: 39.34270627578,
    },
    volume: {
      h24: 0,
      d30: 0,
    },
  },
  {
    id: "21",
    symbol: "USDT-DFI",
    displaySymbol: "dUSDT-DFI",
    name: "Playground USDT-Default Defi token",
    status: true,
    tokenA: {
      symbol: "USDT",
      displaySymbol: "dUSDT",
      id: "3",
      name: "Playground USDT",
      reserve: "10000000",
      blockCommission: "0",
    },
    tokenB: {
      symbol: "DFI",
      displaySymbol: "DFI",
      id: "0",
      name: "Default Defi token",
      reserve: "1000",
      blockCommission: "0",
    },
    priceRatio: {
      ab: "10000",
      ba: "0.0001",
    },
    commission: "0",
    totalLiquidity: {
      token: "100000",
      usd: "20000000",
    },
    tradeEnabled: true,
    ownerAddress: "mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy",
    rewardPct: "0.05882353",
    rewardLoanPct: "0",
    creation: {
      tx: "c9c043915c256554b2efc41b269621d9cc412874f3d8153ee1a39354dd1e2a1a",
      height: 147,
    },
    apr: {
      reward: 39.34270627578,
      commission: 0,
      total: 39.34270627578,
    },
    volume: {
      h24: 0,
      d30: 0,
    },
  },
  {
    id: "22",
    symbol: "LTC-DFI",
    displaySymbol: "dLTC-DFI",
    name: "Playground LTC-Default Defi token",
    status: true,
    tokenA: {
      symbol: "LTC",
      displaySymbol: "dLTC",
      id: "4",
      name: "Playground LTC",
      reserve: "10000",
      blockCommission: "0",
    },
    tokenB: {
      symbol: "DFI",
      displaySymbol: "DFI",
      id: "0",
      name: "Default Defi token",
      reserve: "100",
      blockCommission: "0",
    },
    priceRatio: {
      ab: "100",
      ba: "0.01",
    },
    commission: "0",
    totalLiquidity: {
      token: "1000",
      usd: "2000000",
    },
    tradeEnabled: true,
    ownerAddress: "mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy",
    rewardPct: "0.05882353",
    rewardLoanPct: "0",
    creation: {
      tx: "4b4789b0ff718c91b30c6cd311ce6279fda04c4c26aefaf36472dd02ef39ea24",
      height: 150,
    },
    apr: {
      reward: 393.4270627578,
      commission: 0,
      total: 393.4270627578,
    },
    volume: {
      h24: 0,
      d30: 0,
    },
  },
  {
    id: "23",
    symbol: "USDC-DFI",
    displaySymbol: "dUSDC-DFI",
    name: "Playground USDC-Default Defi token",
    status: true,
    tokenA: {
      symbol: "USDC",
      displaySymbol: "dUSDC",
      id: "5",
      name: "Playground USDC",
      reserve: "20000000",
      blockCommission: "0",
    },
    tokenB: {
      symbol: "DFI",
      displaySymbol: "DFI",
      id: "0",
      name: "Default Defi token",
      reserve: "2000",
      blockCommission: "0",
    },
    priceRatio: {
      ab: "10000",
      ba: "0.0001",
    },
    commission: "0",
    totalLiquidity: {
      token: "200000",
      usd: "40000000",
    },
    tradeEnabled: true,
    ownerAddress: "mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy",
    rewardPct: "0.05882353",
    rewardLoanPct: "0",
    creation: {
      tx: "b24e3d0ce0c00d5593c14ab16e930dd4b9bbf128530e1bb03bd32bd9fb9e35cb",
      height: 153,
    },
    apr: {
      reward: 19.67135313789,
      commission: 0,
      total: 19.67135313789,
    },
    volume: {
      h24: 0,
      d30: 0,
    },
  },
  {
    id: "24",
    symbol: "DUSD-DFI",
    displaySymbol: "DUSD-DFI",
    name: "Decentralized USD-Default Defi token",
    status: true,
    tokenA: {
      symbol: "DUSD",
      displaySymbol: "DUSD",
      id: "14",
      name: "Decentralized USD",
      reserve: "10001160",
      blockCommission: "0",
    },
    tokenB: {
      symbol: "DFI",
      displaySymbol: "DFI",
      id: "0",
      name: "Default Defi token",
      reserve: "10000116",
      blockCommission: "0",
    },
    priceRatio: {
      ab: "1.00010439",
      ba: "0.99989561",
    },
    commission: "0.02",
    totalLiquidity: {
      token: "10000116",
      usd: "20002320",
    },
    tradeEnabled: true,
    ownerAddress: "mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy",
    rewardPct: "0.05882353",
    rewardLoanPct: "0",
    creation: {
      tx: "30b3501edd4a90bac9939ab1a33597fff7ad783f5ed7ae4a4dd85e9858aee299",
      height: 156,
    },
    apr: {
      reward: 39.338143051186066,
      commission: 0,
      total: 39.338143051186066,
    },
    volume: {
      h24: 0,
      d30: 0,
    },
  },
];
