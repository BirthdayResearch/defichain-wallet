import { EnvironmentNetwork } from "../environment";
import { networkMapper } from "./NetworkContext";

describe('network context', () => {
  it('should correctly map network', () => {
    expect(networkMapper(EnvironmentNetwork.MainNet)).toStrictEqual('mainnet')
    expect(networkMapper(EnvironmentNetwork.TestNet)).toStrictEqual('testnet')
    expect(networkMapper(EnvironmentNetwork.LocalPlayground)).toStrictEqual('regtest')
    expect(networkMapper(EnvironmentNetwork.RemotePlayground)).toStrictEqual('regtest')
  })
})
