import { EnvironmentNetwork } from "@waveshq/walletkit-core";
import { useNetworkContext } from "@waveshq/walletkit-ui";

export function useBlocksPerDay(): number {
  const { network } = useNetworkContext();
  return network === EnvironmentNetwork.MainNet ||
    network === EnvironmentNetwork.TestNet ||
    network === EnvironmentNetwork.DevNet
    ? 2880
    : 144;
}
