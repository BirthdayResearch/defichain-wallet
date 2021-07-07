import { MainNet, Network, RegTest, TestNet } from '@defichain/jellyfish-network'
import { EnvironmentNetwork } from '../../environment'

export function getJellyfishNetwork (network: EnvironmentNetwork): Network {
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
