import { tailwind } from "@tailwind";
import BigNumber from "bignumber.js";
import { ThemedTextV2, ThemedViewV2 } from "./themed";

export function CollateralFactorTag({
  factor,
}: {
  factor?: string;
}): JSX.Element | null {
  const DEFAULT_FACTOR = new BigNumber(1);
  return factor && !DEFAULT_FACTOR.isEqualTo(factor) ? (
    <ThemedViewV2
      style={tailwind("h-5 flex flex-row items-center px-2 rounded border-0.5")}
      light={tailwind("border-mono-light-v2-700")}
      dark={tailwind("border-mono-dark-v2-700")}
    >
      <ThemedTextV2
        style={tailwind("text-xs font-semibold-v2")}
        light={tailwind("text-mono-light-v2-700")}
        dark={tailwind("text-mono-dark-v2-700")}
      >
        {`${factor}x`}
      </ThemedTextV2>
    </ThemedViewV2>
  ) : null;
}
