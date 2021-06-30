import AsyncStorage from "@react-native-async-storage/async-storage";
import { EnvironmentNetwork } from "./environment";
import { getNetwork, setNetwork } from "./storage";

const getItem = jest.spyOn(AsyncStorage, 'getItem')
const setItem = jest.spyOn(AsyncStorage, 'setItem')

describe('network', () => {
  it('should default to Remote Playground', async () => {
    getItem.mockClear()
    expect(await getNetwork()).toBe(EnvironmentNetwork.RemotePlayground)
    expect(getItem).toBeCalled()
  });

  it('should call setItem', async () => {
    await setNetwork(EnvironmentNetwork.RemotePlayground)
    expect(setItem).toBeCalled()
  });

  it('should get Local Playground', async () => {
    getItem.mockResolvedValue(EnvironmentNetwork.LocalPlayground)
    expect(await getNetwork()).toBe(EnvironmentNetwork.LocalPlayground)
  });

  it('should get Local Playground', async () => {
    getItem.mockResolvedValue(EnvironmentNetwork.RemotePlayground)
    expect(await getNetwork()).toBe(EnvironmentNetwork.RemotePlayground)
  });

  it('should errored as network is not part of environment', async () => {
    await expect(setNetwork(EnvironmentNetwork.MainNet))
      .rejects.toThrow('network is not part of environment')
  });
})
