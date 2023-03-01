import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@store";
import { tokensSelector } from "@waveshq/walletkit-ui/dist/store";
import BigNumber from "bignumber.js";
import { useSelector } from "react-redux";
import { getActivePrice } from "../../Auctions/helpers/ActivePrice";
import { CollateralItem } from "../screens/EditCollateralScreen";

export function useCollateralTokenList() {
  const tokens = useSelector((state: RootState) =>
    tokensSelector(state.wallet)
  );

  const getTokenAmount = (tokenId: string): BigNumber => {
    const id = tokenId === "0" ? "0_unified" : tokenId;
    const _token = tokens.find((t) => t.id === id);
    const reservedDFI = 0.1;
    return BigNumber.max(
      new BigNumber(_token === undefined ? 0 : _token.amount).minus(
        _token?.id === "0_unified" ? reservedDFI : 0
      ),
      0
    );
  };

  const collateralSelector = createSelector(
    (state: RootState) => state.loans.collateralTokens,
    (collaterals) =>
      collaterals
        .map((c) => {
          return {
            ...c,
            available: getTokenAmount(c.token.id),
          };
        })
        .filter((collateralItem) =>
          new BigNumber(
            getActivePrice(
              collateralItem.token.symbol,
              collateralItem.activePrice,
              collateralItem.factor,
              "ACTIVE",
              "COLLATERAL"
            )
          ).gt(0)
        )
        .sort((a, b) => b.available.minus(a.available).toNumber())
  );
  const collateralTokens: CollateralItem[] = useSelector((state: RootState) =>
    collateralSelector(state)
  );

  return {
    collateralTokens,
  };
}
