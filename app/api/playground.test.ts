import { PlaygroundApiClient } from "@defichain/playground-api-client";
import { renderHook } from '@testing-library/react-hooks'
import { waitFor } from "@testing-library/react-native";
import { getPlaygroundApiClient, getPlaygroundRpcClient, useCachedPlaygroundClient } from "./playground";

jest.mock('@defichain/playground-api-client')
jest.mock('../storage')

const mocked = {
  PlaygroundApiClient: PlaygroundApiClient as jest.MockedClass<typeof PlaygroundApiClient>,
}

beforeEach(() => {
  jest.clearAllMocks()
})

function getMockClient (success: boolean): PlaygroundApiClient {
  const client = {
    playground: {
      async info (): Promise<void> {
        if (!success) {
          throw new Error('')
        }
      }
    }
  }
  // @ts-ignore
  return client
}

it('should load RemotePlayground', async () => {
  mocked.PlaygroundApiClient.mockImplementation(args => {
    return getMockClient(args.url === "https://playground.defichain.com")
  })

  const { result } = renderHook(() => useCachedPlaygroundClient())
  await waitFor(() => {
    expect(result.current).toBeTruthy()
  })

  expect(getPlaygroundApiClient()).toBeDefined()
  expect(getPlaygroundRpcClient()).toBeDefined()
  expect(PlaygroundApiClient).toBeCalledWith({
    url: "https://playground.defichain.com"
  })
})

it('should load LocalPlayground', async () => {
  mocked.PlaygroundApiClient.mockImplementation(args => {
    return getMockClient(args.url === "http://localhost:19553")
  })

  const { result } = renderHook(() => useCachedPlaygroundClient())
  await waitFor(() => {
    expect(result.current).toBeTruthy()
  })

  expect(getPlaygroundApiClient()).toBeDefined()
  expect(getPlaygroundRpcClient()).toBeDefined()
  expect(PlaygroundApiClient).toBeCalledWith({
    url: "http://localhost:19553"
  })
})
