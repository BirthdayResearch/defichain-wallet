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

it('should getWallets() that is empty', async () => {
  getItem
    .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground)
    .mockResolvedValueOnce("[]")

  const items = await WalletPersistence.get()
  expect(items.length).toStrictEqual(0)
})

it('should add() add()', async () => {
  getItem
    .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground)
    .mockResolvedValueOnce("[]")
    .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground)
    .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground)
    .mockResolvedValueOnce("[]")
    .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground)

  await WalletPersistence.add({ raw: "seed-1", type: WalletType.MNEMONIC_UNPROTECTED, version: "v1" })
  await WalletPersistence.add({ raw: "seed-2", type: WalletType.MNEMONIC_UNPROTECTED, version: "v1" })

  expect(getItem).toBeCalledTimes(6)
})

it('should remove()', async () => {
  getItem
    .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground)
    .mockResolvedValueOnce(JSON.stringify([
      { version: 'v1', type: WalletType.MNEMONIC_UNPROTECTED, raw: '1' },
      { version: 'v1', type: WalletType.MNEMONIC_UNPROTECTED, raw: '2' },
    ]))
    .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground)

  await WalletPersistence.remove(0)

  expect(setItem).toBeCalledTimes(1)
  expect(setItem).toBeCalledWith(
    "Development.Local Playground.WALLET",
    JSON.stringify([
      { version: 'v1', type: WalletType.MNEMONIC_UNPROTECTED, raw: '2' },
    ])
  )
})
