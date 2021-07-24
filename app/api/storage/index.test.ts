import ExpoSecureStore from "expo-secure-store";
import { EnvironmentNetwork } from "../../environment";
import { StorageAPI } from "./index";

// TODO(fuxingloh): 'jest-expo' only test native (provider.native.ts) by default, need to improve testing capability

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}))

const getItem = jest.spyOn(ExpoSecureStore, 'getItemAsync')
const setItem = jest.spyOn(ExpoSecureStore, 'setItemAsync')
const removeItem = jest.spyOn(ExpoSecureStore, 'deleteItemAsync')

beforeEach(() => {
  jest.clearAllMocks()
})

describe('network', () => {
  it('should default to Local Playground', async () => {
    expect(await StorageAPI.getNetwork()).toBe(EnvironmentNetwork.LocalPlayground)
    expect(getItem).toBeCalled()
  });

  it('should call setItem', async () => {
    await StorageAPI.setNetwork(EnvironmentNetwork.RemotePlayground)
    expect(setItem).toBeCalled()
  });

  it('should get Local Playground', async () => {
    getItem.mockResolvedValue(EnvironmentNetwork.LocalPlayground)
    expect(await StorageAPI.getNetwork()).toBe(EnvironmentNetwork.LocalPlayground)
  });

  it('should get Local Playground', async () => {
    getItem.mockResolvedValue(EnvironmentNetwork.RemotePlayground)
    expect(await StorageAPI.getNetwork()).toBe(EnvironmentNetwork.RemotePlayground)
  });

  it('should errored as network is not part of environment', async () => {
    await expect(StorageAPI.setNetwork(EnvironmentNetwork.MainNet))
      .rejects.toThrow('network is not part of environment')
  });
})

describe('item', () => {
  beforeEach(() => {
    getItem.mockResolvedValue(EnvironmentNetwork.RemotePlayground)
  })

  it('should getItem with environment and network prefixed key', async () => {
    await StorageAPI.getItem('get')
    expect(getItem).toBeCalledTimes(2)
    expect(getItem).toBeCalledWith('Development.NETWORK')
    expect(getItem).toBeCalledWith('Development.Remote Playground.get')
  })

  it('should setItem with environment and network prefixed key', async () => {
    await StorageAPI.setItem('set', 'value')
    expect(setItem).toBeCalledWith('Development.Remote Playground.set', 'value')
  })

  it('should removeItem with environment and network prefixed key', async () => {
    await StorageAPI.removeItem('remove')
    expect(removeItem).toBeCalledWith('Development.Remote Playground.remove')
  })
})

describe('byte length validation', () => {
  beforeEach(() => {
    getItem.mockResolvedValue(EnvironmentNetwork.LocalPlayground)
  })

  it('should set if 1 byte length', async () => {
    await StorageAPI.setItem('key', '1')
    expect(setItem).toBeCalledWith('Development.Local Playground.key', '1')
  })

  it('should set if 100 byte length', async () => {
    await StorageAPI.setItem('key', '0000000000100000000020000000003000000000400000000050000000006000000000700000000080000000009000000000')
    expect(setItem).toBeCalledWith('Development.Local Playground.key', '0000000000100000000020000000003000000000400000000050000000006000000000700000000080000000009000000000')
  })

  function generateText (length: number, sequence: string) {
    let text = ''
    for (let i = 0; i < length; i++) {
      text += sequence
    }
    return text
  }

  it('should set if 2047 byte length', async () => {
    const text = generateText(2047, '0')

    await StorageAPI.setItem('key', text)
    expect(setItem).toBeCalledWith('Development.Local Playground.key', text)
  })

  it('should error if 2048 byte length', async () => {
    const text = generateText(2048, '0')
    const promise = StorageAPI.setItem('key', text)
    await expect(promise).rejects.toThrow('value exceed 2048 bytes, unable to setItem')
  })

  it('should error if 2049 byte length', async () => {
    const text = generateText(2049, '0')

    const promise = StorageAPI.setItem('key', text)
    await expect(promise).rejects.toThrow('value exceed 2048 bytes, unable to setItem')
  })

  describe('utf-8 1-4 char', () => {
    it('should set if 3 byte length utf-8', async () => {
      const text = generateText(1, '好')

      await StorageAPI.setItem('key', text)
      expect(setItem).toBeCalledWith('Development.Local Playground.key', text)
    })

    it('should set if 2046 byte length utf-8', async () => {
      const text = generateText(682, '好')

      await StorageAPI.setItem('key', text)
      expect(setItem).toBeCalledWith('Development.Local Playground.key', text)
    })


    it('should error if 2049 byte length', async () => {
      const text = generateText(683, '好')

      const promise = StorageAPI.setItem('key', text)
      await expect(promise).rejects.toThrow('value exceed 2048 bytes, unable to setItem')
    })

    it('should error if 3072 byte length', async () => {
      const text = generateText(1024, '好')

      const promise = StorageAPI.setItem('key', text)
      await expect(promise).rejects.toThrow('value exceed 2048 bytes, unable to setItem')
    })
  })
})
