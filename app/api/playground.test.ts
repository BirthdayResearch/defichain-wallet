import { PlaygroundApiClient } from "@defichain/playground-api-client";
import { renderHook } from '@testing-library/react-hooks'
import { waitFor } from "@testing-library/react-native";
import { EnvironmentNetwork } from "../environment";
import { Logging } from "../logging";
import { getNetwork } from "../storage";
import { getPlaygroundClient, useCachedPlaygroundClient } from "./playground";

jest.mock('@defichain/playground-api-client')
jest.mock('../storage')
jest.spyOn(console, 'log').mockImplementation(jest.fn)
const error = jest.spyOn(Logging, 'error')

beforeEach(() => {
  jest.clearAllMocks()
})

it('should load RemotePlayground', async () => {
  (getNetwork as jest.Mock).mockResolvedValue(EnvironmentNetwork.RemotePlayground)

  const { result } = renderHook(() => useCachedPlaygroundClient())
  await waitFor(() => {
    expect(result.current).toBeTruthy()
  })

  expect(getPlaygroundClient()).toBeDefined()
  expect(PlaygroundApiClient).toBeCalledWith({
    url: "https://playground.defichain.com"
  })
})

it('should load LocalPlayground', async () => {
  (getNetwork as jest.Mock).mockResolvedValue(EnvironmentNetwork.LocalPlayground)

  const { result } = renderHook(() => useCachedPlaygroundClient())
  await waitFor(() => {
    expect(result.current).toBeTruthy()
  })

  expect(getPlaygroundClient()).toBeDefined()
  expect(PlaygroundApiClient).toBeCalledWith({
    url: "http://localhost:19553"
  })
})

it('should load MainNet but playground not available', async () => {
  (getNetwork as jest.Mock).mockResolvedValue(EnvironmentNetwork.MainNet)

  renderHook(() => useCachedPlaygroundClient())
  await waitFor(() => {
    expect(error).toBeCalled()
  })
})
