import { WhaleApiClient } from "@defichain/whale-api-client";
import { EnvironmentNetwork } from "../../environment";
import { getNetwork } from "../storage";
import { getWhaleClient, initWhaleClient } from "./whale";

jest.mock('@defichain/whale-api-client')
jest.mock('../storage')

const mocked = {
  getNetwork: getNetwork as jest.MockedFunction<typeof getNetwork>,
}

beforeEach(() => {
  jest.clearAllMocks()
})

it('should load MainNet', async () => {
  mocked.getNetwork.mockResolvedValue(EnvironmentNetwork.MainNet)

  await initWhaleClient()

  expect(getWhaleClient()).toBeDefined()
  expect(WhaleApiClient).toBeCalledWith({
    network: "mainnet",
    url: "https://ocean.defichain.com"
  })
})

it('should load TestNet', async () => {
  mocked.getNetwork.mockResolvedValue(EnvironmentNetwork.TestNet)

  await initWhaleClient()

  expect(getWhaleClient()).toBeDefined()
  expect(WhaleApiClient).toBeCalledWith({
    network: "testnet",
    url: "https://ocean.defichain.com"
  })
})

it('should load RemotePlayground', async () => {
  mocked.getNetwork.mockResolvedValue(EnvironmentNetwork.RemotePlayground)

  await initWhaleClient()

  expect(getWhaleClient()).toBeDefined()
  expect(WhaleApiClient).toBeCalledWith({
    network: "regtest",
    url: "https://playground.defichain.com"
  })
})

it('should load LocalPlayground', async () => {
  mocked.getNetwork.mockResolvedValue(EnvironmentNetwork.LocalPlayground)

  await initWhaleClient()

  expect(getWhaleClient()).toBeDefined()
  expect(WhaleApiClient).toBeCalledWith({
    network: "regtest",
    url: "http://localhost:19553"
  })
})
