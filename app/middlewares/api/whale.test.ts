import { WhaleApiClient } from "@defichain/whale-api-client";
import { renderHook } from '@testing-library/react-hooks'
import { waitFor } from "@testing-library/react-native";
import { EnvironmentNetwork } from "../../environment";
import { getNetwork } from "../storage";
import { getWhaleClient, useCachedWhaleClient } from "./whale";

jest.mock('@defichain/whale-api-client')
jest.mock('../storage')

beforeEach(() => {
  jest.clearAllMocks()
})

it('should load MainNet', async () => {
  (getNetwork as jest.Mock).mockResolvedValue(EnvironmentNetwork.MainNet)

  const { result } = renderHook(() => useCachedWhaleClient())
  await waitFor(() => {
    expect(result.current).toBeTruthy()
  })

  expect(getWhaleClient()).toBeDefined()
  expect(WhaleApiClient).toBeCalledWith({
    network: "mainnet",
    url: "https://ocean.defichain.com"
  })
})

it('should load TestNet', async () => {
  (getNetwork as jest.Mock).mockResolvedValue(EnvironmentNetwork.TestNet)

  const { result } = renderHook(() => useCachedWhaleClient())
  await waitFor(() => {
    expect(result.current).toBeTruthy()
  })

  expect(getWhaleClient()).toBeDefined()
  expect(WhaleApiClient).toBeCalledWith({
    network: "testnet",
    url: "https://ocean.defichain.com"
  })
})

it('should load RemotePlayground', async () => {
  (getNetwork as jest.Mock).mockResolvedValue(EnvironmentNetwork.RemotePlayground)

  const { result } = renderHook(() => useCachedWhaleClient())
  await waitFor(() => {
    expect(result.current).toBeTruthy()
  })

  expect(getWhaleClient()).toBeDefined()
  expect(WhaleApiClient).toBeCalledWith({
    network: "regtest",
    url: "https://playground.defichain.com"
  })
})

it('should load LocalPlayground', async () => {
  (getNetwork as jest.Mock).mockResolvedValue(EnvironmentNetwork.LocalPlayground)

  const { result } = renderHook(() => useCachedWhaleClient())
  await waitFor(() => {
    expect(result.current).toBeTruthy()
  })

  expect(getWhaleClient()).toBeDefined()
  expect(WhaleApiClient).toBeCalledWith({
    network: "regtest",
    url: "http://localhost:19553"
  })
})
