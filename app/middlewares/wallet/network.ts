import { MainNet, Network, RegTest, TestNet } from '@defichain/jellyfish-network'
import { EnvironmentNetwork } from '../../environment'
import { getNetwork } from '../storage'

export async function getNetworkOptions (): Promise<Network> {
  const network = await getNetwork()

  switch (network) {
    case EnvironmentNetwork.MainNet:
      return MainNet
    case EnvironmentNetwork.TestNet:
      return TestNet
    case EnvironmentNetwork.LocalPlayground:
    case EnvironmentNetwork.RemotePlayground:
      return RegTest
  }
}
