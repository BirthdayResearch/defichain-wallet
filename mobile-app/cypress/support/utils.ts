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
