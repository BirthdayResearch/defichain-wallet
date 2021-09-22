import { MainNet, Network, RegTest, TestNet } from '@defichain/jellyfish-network'
import { Bip32Options } from '@defichain/jellyfish-wallet-mnemonic'
import { EnvironmentNetwork } from '@environment'

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

export function getBip32Option (envNetwork: EnvironmentNetwork): Bip32Options {
  const network = getJellyfishNetwork(envNetwork)
  return {
    bip32: {
      public: network.bip32.publicPrefix,
      private: network.bip32.privatePrefix
    },
    wif: network.wifPrefix
  }
}
