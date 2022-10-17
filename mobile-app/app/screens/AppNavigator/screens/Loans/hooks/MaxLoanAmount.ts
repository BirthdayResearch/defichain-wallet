import { LoanVaultTokenAmount } from "@defichain/whale-api-client/dist/api/loan";
import { RootState } from "@store";
import BigNumber from "bignumber.js";
import { useSelector } from "react-redux";
import { getActivePrice } from "../../Auctions/helpers/ActivePrice";

interface useMaxLoanProps {
  totalCollateralValue: BigNumber;
  collateralAmounts: LoanVaultTokenAmount[];
  existingLoanValue: BigNumber;
  minColRatio: BigNumber;
  loanActivePrice?: BigNumber;
  interestPerBlock?: BigNumber;
}

/**
 * To calculate max loan based on three conditions:
 * 1. Max loan amount, A <= Total col value / min col ratio
 * 2. Max loan amount, B <= 2 * (DFI col value + DUSD col value) / min col ratio
 * 3. Final max loan amount = min(A, B)
 *
 * Return max loan amount if `loanActivePrice` is passed, max loan value otherwise.
 */
export function useMaxLoan({
  totalCollateralValue,
  collateralAmounts,
  existingLoanValue,
  minColRatio,
  loanActivePrice = new BigNumber(1),
  interestPerBlock = new BigNumber(0),
}: useMaxLoanProps): BigNumber {
  // 1st condition
  const maxLoanBoundedByColRatio = totalCollateralValue
    .dividedBy(minColRatio.dividedBy(100))
    .minus(existingLoanValue)
    .dividedBy(loanActivePrice)
    .dividedBy(interestPerBlock.plus(1));

  // 2nd condition
  const collateralTokens = useSelector(
    (state: RootState) => state.loans.collateralTokens
  );
  const getSpecialCollateralValue = (): BigNumber => {
    // Calculate DFI collateral value
    const dfiCollateralAmount = collateralAmounts.find(
      (colAmount) => colAmount.displaySymbol === "DFI"
    );
    const dfiCollateralValue = new BigNumber(
      dfiCollateralAmount?.amount ?? 0
    ).multipliedBy(getActivePrice("DFI", dfiCollateralAmount?.activePrice));
    // Calculate DUSD collateral value
    const dusdCollateralAmount = collateralAmounts.find(
      (colAmount) => colAmount.displaySymbol === "DUSD"
    );
    const dusdCollateralToken = collateralTokens.find(
      (token) => token.token.displaySymbol === "DUSD"
    );
    const dusdCollateralValue = new BigNumber(
      dusdCollateralAmount?.amount ?? 0
    ).multipliedBy(
      getActivePrice(
        "DUSD",
        undefined,
        dusdCollateralToken?.factor,
        "ACTIVE",
        "COLLATERAL"
      )
    );
    return dfiCollateralValue.plus(dusdCollateralValue);
  };

  const maxLoanBoundedByColCondition = getSpecialCollateralValue()
    .multipliedBy(2)
    .dividedBy(minColRatio.dividedBy(100))
    .minus(existingLoanValue)
    .dividedBy(loanActivePrice);

  const finalMaxLoan = maxLoanBoundedByColRatio.isLessThanOrEqualTo(
    maxLoanBoundedByColCondition
  )
    ? maxLoanBoundedByColRatio.multipliedBy(0.99999999)
    : maxLoanBoundedByColCondition.multipliedBy(0.99999999); // to account for rounding adjustment
  return BigNumber.max(finalMaxLoan, 0); // to not return negative value
}
