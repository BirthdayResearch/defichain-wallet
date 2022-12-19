import { RootState } from "@store";
import { WalletToken } from "@waveshq/walletkit-ui/dist/store";
import BigNumber from "bignumber.js";
import { useSelector } from "react-redux";

interface AmountBreakdown {
  tokenATotal: BigNumber;
  tokenBTotal: BigNumber;
}

/**
 * To return estimated token breakdown for Your pool pair based on reserve of token A and B and total pool pair amount
 */
export function useYourPoolPairAmountBreakdown(
  yourPoolPair: WalletToken
): AmountBreakdown {
  const { poolpairs: pairs } = useSelector((state: RootState) => state.wallet);
  const poolPairData = pairs.find((pr) => pr.data.id === yourPoolPair.id)?.data;

  const toRemove = new BigNumber(1)
    .times(yourPoolPair.amount)
    .decimalPlaces(8, BigNumber.ROUND_DOWN);

  const ratioToTotal = toRemove.div(poolPairData?.totalLiquidity?.token ?? 1);

  // assume defid will trim the dust values too
  const tokenATotal = ratioToTotal
    .times(poolPairData?.tokenA.reserve ?? 0)
    .decimalPlaces(8, BigNumber.ROUND_DOWN);
  const tokenBTotal = ratioToTotal
    .times(poolPairData?.tokenB.reserve ?? 0)
    .decimalPlaces(8, BigNumber.ROUND_DOWN);

  return {
    tokenATotal,
    tokenBTotal,
  };
}
