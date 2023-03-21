import {
  AnnouncementData,
  EnvironmentNetwork,
  PoolpairWithStabInfo,
} from "@waveshq/walletkit-core";
import {
  useGetPairsWithStabilizationFeeQuery,
  useNetworkContext,
} from "@waveshq/walletkit-ui";
import { useLanguageContext } from "@shared-contexts/LanguageProvider";
import { nativeApplicationVersion } from "expo-application";
import { useCallback, useState } from "react";
import { useTokenBestPath } from "@screens/AppNavigator/screens/Portfolio/hooks/TokenBestPath";
import { useFocusEffect } from "@react-navigation/native";
import { SwapPathPoolPair } from "@defichain/whale-api-client/dist/api/poolpairs";
import {
  OwnedTokenState,
  TokenState,
} from "../CompositeSwap/CompositeSwapScreen";
import {
  Announcement,
  findDisplayedAnnouncementForVersion,
} from "../../Portfolio/components/Announcements";

export type DexStabilizationType =
  | "direct-dusd-with-fee"
  | "composite-dusd-with-fee"
  | "none";

type DexStabilizationTokenA = OwnedTokenState | undefined;
type DexStabilizationTokenB = TokenState | undefined;

interface DexStabilization {
  dexStabilizationType: DexStabilizationType;
  dexStabilizationFee: string;
  pair: {
    displaySymbol: string;
    tokenADisplaySymbol: string;
    tokenBDisplaySymbol: string;
  };
}

export function useDexStabilization(
  tokenA: DexStabilizationTokenA,
  tokenB: DexStabilizationTokenB
): {
  dexStabilizationAnnouncement: Announcement | undefined;
  dexStabilization: DexStabilization;
} {
  const { getBestPath } = useTokenBestPath();
  const { language } = useLanguageContext();
  const { network } = useNetworkContext();
  const { data: poolpairsWithDexFee } = useGetPairsWithStabilizationFeeQuery({
    network,
  });

  // local state
  const [announcementToDisplay, setAnnouncementToDisplay] =
    useState<AnnouncementData[]>();
  const [dexStabilization, setDexStabilization] = useState<DexStabilization>({
    dexStabilizationType: "none",
    pair: {
      displaySymbol: "",
      tokenADisplaySymbol: "",
      tokenBDisplaySymbol: "",
    },
    dexStabilizationFee: "0",
  });

  const swapAnnouncement = findDisplayedAnnouncementForVersion(
    nativeApplicationVersion ?? "0.0.0",
    language,
    [],
    announcementToDisplay
  );

  useFocusEffect(
    useCallback(() => {
      const _setAnnouncementToDisplay = async (): Promise<void> => {
        setAnnouncementToDisplay(
          await _getHighDexStabilizationFeeAnnouncement(tokenA, tokenB)
        );
      };

      _setAnnouncementToDisplay();
    }, [tokenA, tokenB, poolpairsWithDexFee])
  );

  const getHighFeesUrl = (pairDisplaySymbol: string): string => {
    let highFeeScanUrl = `https://defiscan.live/dex/${pairDisplaySymbol}`;
    if (
      [
        EnvironmentNetwork.DevNet,
        EnvironmentNetwork.LocalPlayground,
        EnvironmentNetwork.RemotePlayground,
        EnvironmentNetwork.TestNet,
      ].includes(network)
    ) {
      highFeeScanUrl = `https://defiscan.live/dex/${pairDisplaySymbol}?network=${network}`;
    }
    return highFeeScanUrl;
  };

  const _getHighDexStabilizationFeeAnnouncement = useCallback(
    async (
      tokenA: DexStabilizationTokenA,
      tokenB: DexStabilizationTokenB
    ): Promise<AnnouncementData[]> => {
      let announcement: AnnouncementData[] = [];
      if (tokenA === undefined || tokenB === undefined) {
        return announcement;
      }

      const dexStabilization = await _getDexStabilization(tokenA, tokenB);
      setDexStabilization(dexStabilization);

      const {
        dexStabilizationType,
        pair,
        dexStabilizationFee: fee,
      } = dexStabilization;
      const highFeesUrl = getHighFeesUrl(pair.displaySymbol);

      if (dexStabilizationType === "direct-dusd-with-fee") {
        announcement = [
          {
            lang: {
              en: `There is currently a high DEX Stabilization fee of ${fee}% imposed on ${tokenA.displaySymbol} -> ${tokenB.displaySymbol} swaps. Proceed with caution!`,
              de: `Derzeit wird eine hohe DEX-Stabilisierungsgebühr von ${fee}% auf ${tokenA.displaySymbol} -> ${tokenB.displaySymbol}-Tauschgeschäfte erhoben. Vorsicht ist geboten!`,
              "zh-Hans": `There is currently a high DEX Stabilization fee of ${fee}% imposed on ${tokenA.displaySymbol} -> ${tokenB.displaySymbol} swaps. Proceed with caution!`,
              "zh-Hant": `There is currently a high DEX Stabilization fee of ${fee}% imposed on ${tokenA.displaySymbol} -> ${tokenB.displaySymbol} swaps. Proceed with caution!`,
              fr: `Il y a actuellement des frais de stabilisation DEX élevés de ${fee}% imposés sur les échanges de ${tokenA.displaySymbol} -> ${tokenB.displaySymbol}. Procéder avec prudence !`,
              es: `There is currently a high DEX Stabilization fee of ${fee}% imposed on ${tokenA.displaySymbol} -> ${tokenB.displaySymbol} swaps. Proceed with caution!`,
              it: `There is currently a high DEX Stabilization fee of ${fee}% imposed on ${tokenA.displaySymbol} -> ${tokenB.displaySymbol} swaps. Proceed with caution!`,
            },
            version: ">=1.16.1",
            url: {
              ios: highFeesUrl,
              android: highFeesUrl,
              windows: highFeesUrl,
              web: highFeesUrl,
              macos: highFeesUrl,
            },
            type: "OUTAGE",
          },
        ];
      } else if (dexStabilizationType === "composite-dusd-with-fee") {
        announcement = [
          {
            lang: {
              en: `Your swap consists of a composite path (${pair.tokenADisplaySymbol} -> ${pair.tokenBDisplaySymbol}) which will incur DEX Stabilization fees of ${fee}%.`,
              de: `Dein Tausch besteht aus einem zusammengesetzten Pfad (${pair.tokenADisplaySymbol} -> ${pair.tokenBDisplaySymbol}) im Rahmen eines Komposit-Swaps, für den DEX-Stabilisierungsgebühren in Höhe von ${fee}% anfallen.`,
              "zh-Hans": `Your swap consists of a composite path (${pair.tokenADisplaySymbol} -> ${pair.tokenBDisplaySymbol}) which will incur DEX Stabilization fees of ${fee}%.`,
              "zh-Hant": `Your swap consists of a composite path (${pair.tokenADisplaySymbol} -> ${pair.tokenBDisplaySymbol}) which will incur DEX Stabilization fees of ${fee}%.`,
              fr: `Votre échange consiste en un chemin composite (${pair.tokenADisplaySymbol} -> ${pair.tokenBDisplaySymbol}) dans le cadre d'un swap composite qui entraînera des frais de stabilisation DEX de ${fee}%. `,
              es: `Your swap consists of a composite path (${pair.tokenADisplaySymbol} -> ${pair.tokenBDisplaySymbol}) which will incur DEX Stabilization fees of ${fee}%.`,
              it: `Your swap consists of a composite path (${pair.tokenADisplaySymbol} -> ${pair.tokenBDisplaySymbol}) which will incur DEX Stabilization fees of ${fee}%.`,
            },
            version: ">=1.16.1",
            url: {
              ios: highFeesUrl,
              android: highFeesUrl,
              windows: highFeesUrl,
              web: highFeesUrl,
              macos: highFeesUrl,
            },
            type: "OUTAGE",
          },
        ];
      }

      return announcement;
    },
    [poolpairsWithDexFee]
  );

  const convertPairsToNodes = (bestPath: SwapPathPoolPair[]): string[] => {
    /*
      Convert pairs[] to bestPathNodes[] in proper direction in array shape -- bestPathNodes[]
      pairs: [w-x -> y-x -> z-y] ---> proper direction [w-x -> x-y -> y-z] ---> bestPathNodes: [w,x,y,z]
    */
    let bestPathNodes: string[] = [];
    bestPath.forEach((currentPair, index) => {
      const nextPair = bestPath[index + 1];
      const prevPair = bestPath[index - 1];

      if (nextPair === undefined) {
        // last pair
        const prevPairTokenB =
          bestPathNodes[bestPathNodes.length - 1] ===
          prevPair.tokenA.displaySymbol
            ? prevPair.tokenB.displaySymbol
            : prevPair.tokenA.displaySymbol;

        bestPathNodes =
          prevPairTokenB === currentPair.tokenA.displaySymbol
            ? bestPathNodes.concat([
                currentPair.tokenA.displaySymbol,
                currentPair.tokenB.displaySymbol,
              ])
            : bestPathNodes.concat([
                currentPair.tokenB.displaySymbol,
                currentPair.tokenA.displaySymbol,
              ]);
      } else if (
        [nextPair.tokenA.displaySymbol, nextPair.tokenB.displaySymbol].includes(
          currentPair.tokenA.displaySymbol
        )
      ) {
        bestPathNodes.push(currentPair.tokenB.displaySymbol);
      } else {
        bestPathNodes.push(currentPair.tokenA.displaySymbol);
      }
    });

    return bestPathNodes;
  };

  const getCompositeSwapDexStabilization = useCallback(
    (bestPath: SwapPathPoolPair[]): DexStabilization | undefined => {
      /* Not composite swap if there's only one leg */
      if (bestPath.length === 1) {
        return;
      }

      const bestPathNodes = convertPairsToNodes(bestPath);

      /*
      Based from bestPathNodes: [w,x,y,z], check if direction is correct in pairsWithDexFee e.g [w-x,y-x,z-y]
      Right direction: [w-x],
      Wrong direction: [z-y], [y.x]
    */
      let pairWithDexFee: PoolpairWithStabInfo | undefined;
      for (let i = 0; i <= bestPathNodes.length; i++) {
        pairWithDexFee =
          poolpairsWithDexFee?.find(
            (p) =>
              p.tokenADisplaySymbol === bestPathNodes[i] &&
              p.tokenBDisplaySymbol === bestPathNodes[i + 1]
          ) ?? pairWithDexFee;
      }

      if (pairWithDexFee === undefined) {
        return undefined;
      }

      const { tokenADisplaySymbol, tokenBDisplaySymbol, pairDisplaySymbol } =
        pairWithDexFee;
      return {
        dexStabilizationType: "composite-dusd-with-fee",
        pair: {
          displaySymbol: pairDisplaySymbol,
          tokenADisplaySymbol,
          tokenBDisplaySymbol,
        },
        dexStabilizationFee: pairWithDexFee.dexStabilizationFee,
      };
    },
    [poolpairsWithDexFee]
  );

  const _getDexStabilization = async (
    tokenA: DexStabilizationTokenA,
    tokenB: DexStabilizationTokenB
  ): Promise<DexStabilization> => {
    const _dexStabilization: DexStabilization = {
      dexStabilizationType: "none",
      pair: {
        displaySymbol: "",
        tokenADisplaySymbol: "",
        tokenBDisplaySymbol: "",
      },
      dexStabilizationFee: "0",
    };

    if (tokenA === undefined || tokenB === undefined) {
      return _dexStabilization;
    }

    const { bestPath } = await getBestPath(
      tokenA.id === "0_unified" ? "0" : tokenA.id,
      tokenB.id === "0_unified" ? "0" : tokenB.id
    );

    /*
      Direct swap - checking the length is impt because when the pair is disabled, then the path used will be different
    */
    const pairWithDexFee = poolpairsWithDexFee?.find(
      (pair) =>
        pair.tokenADisplaySymbol === tokenA.displaySymbol &&
        pair.tokenBDisplaySymbol === tokenB.displaySymbol
    );
    if (bestPath.length === 1 && pairWithDexFee) {
      return {
        dexStabilizationType: "direct-dusd-with-fee",
        pair: {
          displaySymbol: pairWithDexFee.pairDisplaySymbol,
          tokenADisplaySymbol: tokenA.displaySymbol,
          tokenBDisplaySymbol: tokenB.displaySymbol,
        },
        dexStabilizationFee: pairWithDexFee.dexStabilizationFee,
      };
    }

    /*
      Otherwise, check for composite swap
        1. Get index of DUSD-(DFI | USDT | USDC | EUROC) pair
        2. If index === 0 Check if first leg in best path is DUSD-(DFI | USDT | USDC) and second leg is (DFI | USDT | USDC | EUROC) respectively
        3. Else check if the previous pair tokenB is DUSD to ensure that the direction of DUSD-DFI is DUSD -> DFI | USDT | USDC | EUROC
    */
    const compositeSwapDexStabilization =
      getCompositeSwapDexStabilization(bestPath);

    return compositeSwapDexStabilization ?? _dexStabilization;
  };

  return {
    dexStabilizationAnnouncement: swapAnnouncement,
    dexStabilization,
  };
}
