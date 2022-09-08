import { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import BigNumber from "bignumber.js";
import { RootState } from "@store";
import { DexItem, fetchSwappableTokens, tokensSelector } from "@store/wallet";
import { useWhaleApiClient } from "@shared-contexts/WhaleContext";
import { BottomSheetToken } from "@components/BottomSheetTokenList";
import { CacheApi } from "@api/cache";
import { useNetworkContext } from "@shared-contexts/NetworkContext";
import { useFocusEffect } from "@react-navigation/core";
import { AllSwappableTokensResult } from "@defichain/whale-api-client/dist/api/poolpairs";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { loanTokensSelector } from "@store/loans";
import { TokenState } from "../CompositeSwap/CompositeSwapScreenV2";

interface TokenPrice {
  toTokens: BottomSheetToken[];
  fromTokens: BottomSheetToken[];
}

export function useSwappableTokensV2(
  fromTokenId: string | undefined,
  fromTokenDisplaySymbol: string | undefined,
  isFutureSwap: boolean
): TokenPrice {
  const client = useWhaleApiClient();
  const { network } = useNetworkContext();
  const dispatch = useAppDispatch();
  const blockCount = useSelector((state: RootState) => state.block.count);
  const { swappableTokens, poolpairs } = useSelector(
    (state: RootState) => state.wallet
  );
  const tokens = useSelector((state: RootState) =>
    tokensSelector(state.wallet)
  );
  const loanTokens = useSelector((state: RootState) =>
    loanTokensSelector(state.loans)
  );

  const [fromTokens, setFromTokens] = useState<BottomSheetToken[]>([]);
  const [allTokens, setAllTokens] = useState<TokenState[]>();

  const cacheKey = `WALLET.${network}.${blockCount ?? 0}.SWAP_FROM_${
    fromTokenId ?? 0
  }`;
  const cachedData = CacheApi.get(cacheKey);

  /* Opted out of using useMemo to ensure it'll only run when screen is focused */
  useFocusEffect(
    useCallback(() => {
      const _allTokens = poolpairs.reduce(
        (tokensInPair: TokenState[], pair: DexItem): TokenState[] => {
          const hasTokenA = tokensInPair.some(
            (token) => pair.data.tokenA.id === token.id
          );
          const hasTokenB = tokensInPair.some(
            (token) => pair.data.tokenB.id === token.id
          );
          const tokensToAdd: TokenState[] = [];
          if (!hasTokenA) {
            tokensToAdd.push(pair.data.tokenA);
          }
          if (!hasTokenB) {
            tokensToAdd.push(pair.data.tokenB);
          }

          return [...tokensInPair, ...tokensToAdd];
        },
        []
      );

      let filterTokens = _allTokens;
      if (isFutureSwap) {
        // filter out loanTokens and DUSD
        filterTokens = filterTokens.filter((t) =>
          loanTokens.map((loan) => loan.token.id).includes(t.id)
        );
      }
      const swappableFromTokens: BottomSheetToken[] = filterTokens
        .map((token) => {
          const tokenId = token.id === "0" ? "0_unified" : token.id;
          const ownedToken = tokens.find((t) => t.id === tokenId);
          return {
            tokenId: tokenId,
            available: new BigNumber(
              ownedToken === undefined ? 0 : ownedToken.amount
            ),
            token: {
              displaySymbol: token.displaySymbol,
              name: token.name ?? "",
              symbol: token.symbol,
            },
            reserve: token.reserve,
          };
        })
        .sort((a, b) => b.available.minus(a.available).toNumber());

      setAllTokens(_allTokens);
      setFromTokens(swappableFromTokens);
    }, [poolpairs, tokens, loanTokens, isFutureSwap])
  );

  const toTokens = useMemo(() => {
    const swappableToTokens =
      swappableTokens[fromTokenId === "0_unified" ? "0" : fromTokenId ?? ""];
    const cachedSwappableToTokens =
      (cachedData as AllSwappableTokensResult) ?? swappableToTokens;
    if (fromTokenId !== undefined && swappableToTokens !== undefined) {
      CacheApi.set(
        cacheKey,
        swappableTokens[fromTokenId === "0_unified" ? "0" : fromTokenId ?? ""]
      );
    }

    if (
      cachedSwappableToTokens === undefined ||
      cachedSwappableToTokens.swappableTokens.length === 0 ||
      allTokens === undefined
    ) {
      return [];
    }

    let filterTokens = cachedSwappableToTokens.swappableTokens;
    if (isFutureSwap) {
      // filter out loanTokens and DUSD
      filterTokens = filterTokens.filter((t) => {
        if (fromTokenDisplaySymbol === "DUSD") {
          return loanTokens.map((loan) => loan.token.id).includes(t.id);
        }
        return t.displaySymbol === "DUSD";
      });
    }

    const toTokens: BottomSheetToken[] = filterTokens
      .filter((t) => t.displaySymbol !== "dBURN" && !t.symbol.includes("/v1"))
      .map((token) => {
        const tokenId = token.id === "0" ? "0_unified" : token.id;
        const tokenData = allTokens.find((t) => t.id === token.id);

        return {
          tokenId: tokenId,
          available: new BigNumber(tokenData?.reserve ?? NaN),
          token: {
            displaySymbol: token.displaySymbol,
            name: token.name ?? "",
            symbol: token.symbol,
          },
          reserve: tokenData?.reserve ?? "", // TODO(PIERRE): Ask whale to add reserve on response
        };
      })
      .sort((a, b) => new BigNumber(a.tokenId).minus(b.tokenId).toNumber());

    return toTokens;
  }, [
    swappableTokens,
    fromTokenId,
    fromTokenDisplaySymbol,
    cachedData,
    allTokens,
    isFutureSwap,
    loanTokens,
  ]);

  useFocusEffect(
    useCallback(() => {
      if (fromTokenId !== undefined && cachedData === undefined) {
        dispatch(
          fetchSwappableTokens({
            client,
            fromTokenId: fromTokenId === "0_unified" ? "0" : fromTokenId,
          })
        );
      }
    }, [fromTokenId])
  );

  return {
    toTokens,
    fromTokens,
  };
}
