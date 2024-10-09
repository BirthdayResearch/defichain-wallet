import {
  PlaygroundApiClient,
  PlaygroundRpcClient,
} from "@defichain/playground-api-client";
import {
  NativeChainContainer,
  PlaygroundApiContainer,
  StartedNativeChainContainer,
  StartedPlaygroundApiContainer,
  StartedWhaleApiContainer,
  WhaleApiContainer,
} from "@defichain/testcontainers";
import { WhaleApiClient } from "@defichain/whale-api-client";
import { Network } from "testcontainers";

/**
 * DeFiChain Container that runs all necessary containers (Playground, Whale, Ain).
 *
 * */
export class DeFiChainStubContainer {
  async start(): Promise<StartedDeFiChainStubContainer> {
    const network = await new Network().start();
    const defid = await new NativeChainContainer()
      .withNetwork(network)
      .withPreconfiguredRegtestMasternode()
      .start();
    const whale = await new WhaleApiContainer()
      .withNetwork(network)
      .withNativeChain(defid, network)
      .start();
    const playground = await new PlaygroundApiContainer()
      .withNetwork(network)
      .withNativeChain(defid, network)
      .start();
    await playground.waitForReady();
    return new StartedDeFiChainStubContainer(defid, whale, playground);
  }
}

export class StartedDeFiChainStubContainer {
  public playgroundRpcClient: PlaygroundRpcClient;

  public playgroundClient: PlaygroundApiClient;

  public whaleClient: WhaleApiClient;

  public static LOCAL_MNEMONIC =
    "avoid between cupboard there nerve sugar quote foot broom intact seminar culture much anger hold rival moral silly volcano fog service decline tortoise combine";

  constructor(
    protected defid: StartedNativeChainContainer,
    protected whale: StartedWhaleApiContainer,
    protected playground: StartedPlaygroundApiContainer,
  ) {
    this.playgroundClient = new PlaygroundApiClient({
      url: this.playground.getPlaygroundApiClientOptions().url,
    });
    this.playgroundRpcClient = new PlaygroundRpcClient(this.playgroundClient);
    this.whaleClient = new WhaleApiClient(
      this.whale.getWhaleApiClientOptions(),
    );
  }

  async stop(): Promise<void> {
    await this.whale.stop();
    await this.defid.stop();
    await this.playground.stop();
  }

  async generateBlock(): Promise<void> {
    await this.playgroundClient.rpc.call(
      "generatetoaddress",
      [10, "mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy"],
      "number",
    );
  }

  async getWhaleURL(): Promise<string> {
    return this.whale.getWhaleApiClientOptions().url;
  }
}
