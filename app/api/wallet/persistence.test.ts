import ExpoSecureStore from "expo-secure-store";
import { EnvironmentNetwork } from "../../environment";
import { WalletPersistence, WalletType } from "./persistence";

// TODO(fuxingloh): 'jest-expo' only test native (provider.native.ts) by default, need to improve testing capability
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}))

const getItem = jest.spyOn(ExpoSecureStore, 'getItemAsync')
const setItem = jest.spyOn(ExpoSecureStore, 'setItemAsync')

beforeEach(() => {
  jest.clearAllMocks()
})

describe('WalletPersistence.get()', () => {
  it('should get empty', async () => {
    getItem
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground)
      .mockResolvedValueOnce("[]")

    const items = await WalletPersistence.get()
    expect(items.length).toStrictEqual(0)
  })

  it('should get non empty', async () => {
    getItem
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground)
      .mockResolvedValueOnce(JSON.stringify([
        { raw: "raw-1", type: WalletType.MNEMONIC_UNPROTECTED, version: "v1" }
      ]))

    const items = await WalletPersistence.get()
    expect(items.length).toStrictEqual(1)
  })
})

describe('WalletPersistence.set()', () => {
  it('should set 1 wallet', async () => {
    getItem.mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground)

    await WalletPersistence.set([
      { raw: "raw-1", type: WalletType.MNEMONIC_UNPROTECTED, version: "v1" },
    ])

    expect(getItem).toBeCalledTimes(1)
    expect(setItem).toBeCalledWith(
      'Development.Local Playground.WALLET',
      JSON.stringify([
        { raw: "raw-1", type: WalletType.MNEMONIC_UNPROTECTED, version: "v1" },
      ])
    )
  })

  it('should set 2 wallets', async () => {
    getItem.mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground)

    await WalletPersistence.set([
      { raw: "raw-1", type: WalletType.MNEMONIC_UNPROTECTED, version: "v1" },
      { raw: "raw-2", type: WalletType.MNEMONIC_UNPROTECTED, version: "v1" },
    ])

    expect(getItem).toBeCalledTimes(1)
    expect(setItem).toBeCalledWith(
      'Development.Local Playground.WALLET',
      JSON.stringify([
        { raw: "raw-1", type: WalletType.MNEMONIC_UNPROTECTED, version: "v1" },
        { raw: "raw-2", type: WalletType.MNEMONIC_UNPROTECTED, version: "v1" },
      ])
    )
  })
})
