import * as ExpoSecureStore from 'expo-secure-store'
import { EnvironmentNetwork } from '@environment'
import { SecuredStoreAPI } from '@api'

// TODO(fuxingloh): 'jest-expo' only test native (provider.native.ts) by default, need to improve testing capability

const getItem = jest.spyOn(ExpoSecureStore, 'getItemAsync').mockImplementation(jest.fn())
const setItem = jest.spyOn(ExpoSecureStore, 'setItemAsync')
const removeItem = jest.spyOn(ExpoSecureStore, 'deleteItemAsync')

beforeEach(() => {
  jest.clearAllMocks()
})

describe('network', () => {
  it('should default to Local', async () => {
    expect(await SecuredStoreAPI.getNetwork()).toBe(EnvironmentNetwork.LocalPlayground)
    expect(getItem).toBeCalled()
  })

  it('should call setItem', async () => {
    await SecuredStoreAPI.setNetwork(EnvironmentNetwork.RemotePlayground)
    expect(setItem).toBeCalled()
  })

  it('should get Local Playground', async () => {
    getItem.mockResolvedValue(EnvironmentNetwork.LocalPlayground)
    expect(await SecuredStoreAPI.getNetwork()).toBe(EnvironmentNetwork.LocalPlayground)
  })

  it('should get Local RemotePlayground', async () => {
    getItem.mockResolvedValue(EnvironmentNetwork.RemotePlayground)
    expect(await SecuredStoreAPI.getNetwork()).toBe(EnvironmentNetwork.RemotePlayground)
  })

  it.skip('should errored as network is not part of environment', async () => {
    await expect(SecuredStoreAPI.setNetwork(EnvironmentNetwork.MainNet))
      .rejects.toThrow('network is not part of environment')
  })
})

describe('item', () => {
  beforeEach(() => {
    getItem.mockResolvedValue(EnvironmentNetwork.RemotePlayground)
  })

  it('should getItem with environment and network prefixed key', async () => {
    await SecuredStoreAPI.getItem('get')
    expect(getItem).toBeCalledTimes(2)
    expect(getItem).toBeCalledWith('Development.NETWORK')
    expect(getItem).toBeCalledWith('Development.Playground.get')
  })

  it('should setItem with environment and network prefixed key', async () => {
    await SecuredStoreAPI.setItem('set', 'value')
    expect(setItem).toBeCalledWith('Development.Playground.set', 'value')
  })

  it('should removeItem with environment and network prefixed key', async () => {
    await SecuredStoreAPI.removeItem('remove')
    expect(removeItem).toBeCalledWith('Development.Playground.remove')
  })
})

describe('byte length validation', () => {
  beforeEach(() => {
    getItem.mockResolvedValue(EnvironmentNetwork.LocalPlayground)
  })

  it('should set if 1 byte length', async () => {
    await SecuredStoreAPI.setItem('key', '1')
    expect(setItem).toBeCalledWith('Development.Local.key', '1')
  })

  it('should set if 100 byte length', async () => {
    await SecuredStoreAPI.setItem('key', '0000000000100000000020000000003000000000400000000050000000006000000000700000000080000000009000000000')
    expect(setItem).toBeCalledWith('Development.Local.key', '0000000000100000000020000000003000000000400000000050000000006000000000700000000080000000009000000000')
  })

  function generateText (length: number, sequence: string): string {
    let text = ''
    for (let i = 0; i < length; i++) {
      text += sequence
    }
    return text
  }

  it('should set if 2047 byte length', async () => {
    const text = generateText(2047, '0')

    await SecuredStoreAPI.setItem('key', text)
    expect(setItem).toBeCalledWith('Development.Local.key', text)
  })

  it('should error if 2048 byte length', async () => {
    const text = generateText(2048, '0')
    const promise = SecuredStoreAPI.setItem('key', text)
    await expect(promise).rejects.toThrow('value exceed 2048 bytes, unable to setItem')
  })

  it('should error if 2049 byte length', async () => {
    const text = generateText(2049, '0')

    const promise = SecuredStoreAPI.setItem('key', text)
    await expect(promise).rejects.toThrow('value exceed 2048 bytes, unable to setItem')
  })

  describe('utf-8 1-4 char', () => {
    it('should set if 3 byte length utf-8', async () => {
      const text = generateText(1, '好')

      await SecuredStoreAPI.setItem('key', text)
      expect(setItem).toBeCalledWith('Development.Local.key', text)
    })

    it('should set if 2046 byte length utf-8', async () => {
      const text = generateText(682, '好')

      await SecuredStoreAPI.setItem('key', text)
      expect(setItem).toBeCalledWith('Development.Local.key', text)
    })

    it('should error if 2049 byte length', async () => {
      const text = generateText(683, '好')

      const promise = SecuredStoreAPI.setItem('key', text)
      await expect(promise).rejects.toThrow('value exceed 2048 bytes, unable to setItem')
    })

    it('should error if 3072 byte length', async () => {
      const text = generateText(1024, '好')

      const promise = SecuredStoreAPI.setItem('key', text)
      await expect(promise).rejects.toThrow('value exceed 2048 bytes, unable to setItem')
    })
  })
})
