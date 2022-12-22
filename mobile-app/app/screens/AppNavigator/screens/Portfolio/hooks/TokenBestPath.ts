import { useCallback } from "react";
import BigNumber from "bignumber.js";
import { RootState } from "@store";
import {
  PoolPairData,
  BestSwapPathResult,
} from "@defichain/whale-api-client/dist/api/poolpairs";
import { useSelector } from "react-redux";
import { CacheApi } from "@api/cache";
import { useNetworkContext } from "@waveshq/walletkit-ui";
import { useWhaleApiClient } from "@waveshq/walletkit-ui/dist/contexts";

interface CalculatePriceRatesProps {
  aToBPrice: BigNumber;
  bToAPrice: BigNumber;
  estimated: BigNumber;
  estimatedLessDexFees: BigNumber;
}

interface TokenBestPath {
  calculatePriceRates: (
    fromTokenId: string,
    toTokenId: string,
    amount: BigNumber
  ) => Promise<CalculatePriceRatesProps>;
  getArbitraryPoolPair: (
    tokenAId: string,
    tokenBId: string
  ) => Promise<PoolPairData[]>;
  getBestPath: (
    fromTokenId: string,
    toTokenId: string
  ) => Promise<BestSwapPathResult>;
}

export function useTokenBestPath(): TokenBestPath {
  const client = useWhaleApiClient();
  const blockCount = useSelector((state: RootState) => state.block.count);
  const pairs = useSelector((state: RootState) => state.wallet.poolpairs);
  const { network } = useNetworkContext();

  const getTokenId = (id: string): string => {
    return id === "0_unified" || id === "0_utxo" ? "0" : id;
  };

  const getArbitraryPoolPair = useCallback(
    async (tokenAId: string, tokenBId: string): Promise<PoolPairData[]> => {
      const { bestPath } = await getBestPath(
        getTokenId(tokenAId),
        getTokenId(tokenBId)
      );
      return bestPath.reduce(
        (poolPairs: PoolPairData[], path: { poolPairId: string }) => {
          const pair = pairs.find(
            (eachPair) => eachPair.data.id === path.poolPairId
          );
          if (pair === undefined) {
            return poolPairs;
          }
          return [...poolPairs, pair.data];
        },
        []
      );
    },
    [pairs, blockCount]
  );

  const getBestPath = async (
    fromTokenId: string,
    toTokenId: string
  ): Promise<BestSwapPathResult> => {
    const key = `WALLET.${network}.${
      blockCount ?? 0
    }.BEST_PATH_${fromTokenId}_${toTokenId}`;
    const result = CacheApi.get(key);
    if (result !== undefined) {
      return result;
    }
    const bestPathData = await client.poolpairs.getBestPath(
      fromTokenId,
      toTokenId
    );
    CacheApi.set(key, bestPathData);
    return bestPathData;
  };

  const calculatePriceRates = useCallback(
    async (
      fromTokenId: string,
      toTokenId: string,
      amount: BigNumber
    ): Promise<CalculatePriceRatesProps> => {
      const bestPathDataFromTokenAtoB = await getBestPath(
        getTokenId(fromTokenId),
        getTokenId(toTokenId)
      );

      const bestPathDataFromTokenBtoA = await getBestPath(
        getTokenId(toTokenId),
        getTokenId(fromTokenId)
      );

      return {
        aToBPrice: new BigNumber(bestPathDataFromTokenAtoB.estimatedReturn),
        bToAPrice: new BigNumber(bestPathDataFromTokenBtoA.estimatedReturn),
        estimated: new BigNumber(
          bestPathDataFromTokenAtoB.estimatedReturn
        ).times(amount),
        estimatedLessDexFees: new BigNumber(
          bestPathDataFromTokenAtoB.estimatedReturnLessDexFees
        ).times(amount),
      };
    },
    [pairs, blockCount]
  );

  return {
    calculatePriceRates,
    getArbitraryPoolPair,
    getBestPath,
  };
}
