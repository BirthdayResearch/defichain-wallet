import { ThemedTextV2, ThemedViewV2 } from "@components/themed";
import { useNetworkContext } from "@shared-contexts/NetworkContext";
import { isPlayground } from "@waveshq/walletkit-core";
import { tailwind } from "@tailwind";

export function PlaygroundConnection(): JSX.Element {
  const { network } = useNetworkContext();

  return (
    <ThemedViewV2 style={tailwind("px-5 mt-8 mb-6")}>
      {isPlayground(network) && (
        <ThemedTextV2 style={tailwind("text-sm font-normal-v2")}>
          DeFi Playground is a testing blockchain isolated from MainNet for
          testing DeFi applications with mock assets.
        </ThemedTextV2>
      )}
    </ThemedViewV2>
  );
}
