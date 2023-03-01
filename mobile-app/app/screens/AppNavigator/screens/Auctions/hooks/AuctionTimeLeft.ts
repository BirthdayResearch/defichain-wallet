import { EnvironmentNetwork } from "@waveshq/walletkit-core";
import { useNetworkContext } from "@waveshq/walletkit-ui";
import dayjs from "dayjs";
import BigNumber from "bignumber.js";
import { secondsToDhmsDisplay } from "../helpers/SecondstoHm";

interface AuctionTimeLeft {
  timeRemaining: string;
  startTime: string;
  blocksRemaining: number;
  blocksPerAuction: number;
  normalizedBlocks: BigNumber;
  timeRemainingThemedColor: string;
}

export function useAuctionTime(
  liquidationHeight: number,
  blockCount: number
): AuctionTimeLeft {
  const { network } = useNetworkContext();
  const blocksPerAuction =
    network === EnvironmentNetwork.MainNet ||
    network === EnvironmentNetwork.TestNet ||
    network === EnvironmentNetwork.DevNet
      ? 720
      : 36;
  const secondsPerBlock =
    network === EnvironmentNetwork.MainNet ||
    network === EnvironmentNetwork.TestNet ||
    network === EnvironmentNetwork.DevNet
      ? 30
      : 3;
  const blocksRemaining = BigNumber.max(
    liquidationHeight - blockCount,
    0
  ).toNumber();
  const timeSpent = blocksPerAuction - blocksRemaining;
  const normalizedBlocks = new BigNumber(blocksRemaining).dividedBy(
    blocksPerAuction
  );
  return {
    timeRemaining:
      blocksRemaining > 0
        ? secondsToDhmsDisplay(blocksRemaining * secondsPerBlock)
        : "",
    startTime:
      timeSpent > 0
        ? dayjs()
            .subtract(timeSpent * secondsPerBlock, "s")
            .format("LT")
        : "",
    timeRemainingThemedColor: normalizedBlocks.gt(0.5)
      ? "green-v2"
      : normalizedBlocks.gt(0.25)
      ? "orange-v2"
      : "red-v2",
    blocksRemaining,
    blocksPerAuction,
    normalizedBlocks,
  };
}
