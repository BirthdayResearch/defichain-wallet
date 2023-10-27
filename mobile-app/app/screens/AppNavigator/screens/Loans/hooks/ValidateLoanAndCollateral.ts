import {
  CollateralToken,
  LoanToken,
  LoanVaultTokenAmount,
} from "@defichain/whale-api-client/dist/api/loan";
import { RootState } from "@store";
import BigNumber from "bignumber.js";
import { useSelector } from "react-redux";
import { getActivePrice } from "../../Auctions/helpers/ActivePrice";

interface useValidateLoanAndCollateralProps {
  collateralAmounts: LoanVaultTokenAmount[];
  loanAmounts: LoanVaultTokenAmount[];
  collateralValue: BigNumber;
  loanValue: BigNumber;
  loanToken: LoanToken;
  minColRatio: string;
}

/**
 * To check if current vault has either at least 50% of DFI or 100% of DUSD as total collateral when taking DUSD loan
 *
 * Modified formula from [DeFiCh/ain] to include new loan amount to be taken during `Borrow` flow
 * Source: https://github.com/DeFiCh/ain/blob/07ba855f73c7fdfb0b2f10fc3b31fe73c17b1630/src/dfi/consensus/txvisitor.cpp#L270
 *
 * Note: DUSD loops in vaults are now allowed - https://github.com/DeFiCh/ain/pull/1971
 *
 * @returns
 */
export function useValidateLoanAndCollateral(
  props: useValidateLoanAndCollateralProps,
) {
  const collateralTokens: CollateralToken[] = useSelector(
    (state: RootState) => state.loans.collateralTokens,
  );
  const isTakingDUSDLoan = props.loanToken.token.displaySymbol === "DUSD";

  const dfiCollateralToken = collateralTokens.find(
    (col) => col.token.displaySymbol === "DFI",
  );

  const dfiActivePrice = getActivePrice(
    "DFI",
    dfiCollateralToken?.activePrice,
    dfiCollateralToken?.factor,
    "ACTIVE",
    "COLLATERAL",
  );

  const dfiCollateralValue = new BigNumber(dfiActivePrice).multipliedBy(
    props.collateralAmounts.find((col) => col.displaySymbol === "DFI")
      ?.amount ?? 0,
  );
  const totalRequiredCollateral = new BigNumber(props.loanValue)
    .multipliedBy(props.minColRatio)
    .dividedBy(100);

  const isDFIGreaterThanHalfOfRequiredCollateral =
    dfiCollateralValue.isGreaterThanOrEqualTo(
      totalRequiredCollateral.dividedBy(2),
    );

  const isDUSD100PercentOfCollateral = props.collateralAmounts.every(
    (col) => col.displaySymbol === "DUSD",
  );

  const isNonDUSDLoanAllowed =
    !isTakingDUSDLoan && isDFIGreaterThanHalfOfRequiredCollateral;

  const isDUSDLoanAllowed =
    isTakingDUSDLoan &&
    (isDFIGreaterThanHalfOfRequiredCollateral || isDUSD100PercentOfCollateral);

  return {
    isLoanAllowed: isNonDUSDLoanAllowed || isDUSDLoanAllowed,
  };
}
