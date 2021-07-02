import AsyncStorage from "@react-native-async-storage/async-storage";
import { EnvironmentNetwork } from "./environment";
import * as storage from "./storage";

const getItem = jest.spyOn(AsyncStorage, 'getItem')
const setItem = jest.spyOn(AsyncStorage, 'setItem')
const removeItem = jest.spyOn(AsyncStorage, 'removeItem')

beforeEach(() => {
  jest.clearAllMocks()
})

describe('network', () => {
  it('should default to Local Playground', async () => {
    expect(await storage.getNetwork()).toBe(EnvironmentNetwork.LocalPlayground)
    expect(getItem).toBeCalled()
  });

  it('should call setItem', async () => {
    await storage.setNetwork(EnvironmentNetwork.RemotePlayground)
    expect(setItem).toBeCalled()
  });

  it('should get Local Playground', async () => {
    getItem.mockResolvedValue(EnvironmentNetwork.LocalPlayground)
    expect(await storage.getNetwork()).toBe(EnvironmentNetwork.LocalPlayground)
  });

  it('should get Local Playground', async () => {
    getItem.mockResolvedValue(EnvironmentNetwork.RemotePlayground)
    expect(await storage.getNetwork()).toBe(EnvironmentNetwork.RemotePlayground)
  });

  it('should errored as network is not part of environment', async () => {
    await expect(storage.setNetwork(EnvironmentNetwork.MainNet))
      .rejects.toThrow('network is not part of environment')
  });
})

describe('item', () => {
  beforeEach(() => {
    getItem.mockResolvedValue(EnvironmentNetwork.RemotePlayground)
  })

  it('should getItem with environment and network prefixed key', async () => {
    await storage.getItem('get')
    expect(getItem).toBeCalledTimes(2)
    expect(getItem).toBeCalledWith('Development.NETWORK')
    expect(getItem).toBeCalledWith('Development.Remote Playground.get')
  })

  it('should setItem with environment and network prefixed key', async () => {
    await storage.setItem('set', 'value')
    expect(setItem).toBeCalledWith('Development.Remote Playground.set', 'value')
  })

  it('should removeItem with environment and network prefixed key', async () => {
    await storage.removeItem('remove')
    expect(removeItem).toBeCalledWith('Development.Remote Playground.remove')
  })
})
