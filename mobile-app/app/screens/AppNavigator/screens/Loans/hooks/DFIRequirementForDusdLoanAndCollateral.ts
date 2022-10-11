import {
  CollateralToken,
  LoanToken,
  LoanVaultTokenAmount,
} from "@defichain/whale-api-client/dist/api/loan";
import { RootState } from "@store";
import BigNumber from "bignumber.js";
import { useSelector } from "react-redux";
import { getActivePrice } from "../../Auctions/helpers/ActivePrice";

interface useDFIRequirementForDusdLoanAndCollateralProps {
  collateralAmounts: LoanVaultTokenAmount[];
  loanAmounts: LoanVaultTokenAmount[];
  collateralValue: BigNumber;
  loanValue: BigNumber;
  loanToken: LoanToken;
  minColRatio: string;
  newDUSDLoanAmount: BigNumber;
}

/**
 * To check if current vault has at least 50% of DFI as total collateral when taking DUSD loan
 *
 * Modified formula from [DeFiCh/ain] to include new loan amount to be taken during `Borrow` flow
 *
 * Source: https://github.com/DeFiCh/ain/blob/4b3c187f590738f44f5574901f1fec233a53c226/src/masternodes/mn_checks.cpp#L3003
 *
 * @returns
 */
export function useDFIRequirementForDusdLoanAndCollateral(
  props: useDFIRequirementForDusdLoanAndCollateralProps
) {
  const collateralTokens: CollateralToken[] = useSelector(
    (state: RootState) => state.loans.collateralTokens
  );
  const hasDUSDLoan = props.loanAmounts.some(
    (loan) => loan.displaySymbol === "DUSD"
  );
  const isTakingDUSDLoan = props.loanToken.token.displaySymbol === "DUSD";

  const dfiCollateralToken = collateralTokens.find(
    (col) => col.token.displaySymbol === "DFI"
  );
  const dfiActivePrice = getActivePrice(
    "DFI",
    dfiCollateralToken?.activePrice,
    dfiCollateralToken?.factor,
    "ACTIVE",
    "COLLATERAL"
  );
  const dfiCollateralValue = new BigNumber(dfiActivePrice).multipliedBy(
    props.collateralAmounts.find((col) => col.displaySymbol === "DFI")
      ?.amount ?? 0
  );
  const isDFILessThanHalfOfRequiredCollateral = dfiCollateralValue
    .multipliedBy(100)
    .isLessThan(
      new BigNumber(props.loanValue)
        .plus(isTakingDUSDLoan ? props.newDUSDLoanAmount : 0)
        .multipliedBy(props.minColRatio)
        .dividedBy(2)
    );
  return {
    isDFILessThanHalfOfRequiredCollateral:
      hasDUSDLoan && isDFILessThanHalfOfRequiredCollateral,
  };
}
