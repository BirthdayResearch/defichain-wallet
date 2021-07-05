import { OP_CODES } from "@defichain/jellyfish-transaction";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { renderHook } from "@testing-library/react-hooks";
import { waitFor } from "@testing-library/react-native";
import { useCachedWhaleClient } from "../api/whale";
import { EnvironmentNetwork } from "../environment";
import { getWallet, getWallets, useCachedWallets } from "./index";
import { WalletData, WalletType } from "./persistence";

const getItem = jest.spyOn(AsyncStorage, 'getItem')
jest.spyOn(console, 'error').mockImplementation(jest.fn)

beforeEach(async () => {
  jest.clearAllMocks()

  const { result } = renderHook(() => useCachedWhaleClient())
  await waitFor(() => {
    expect(result.current).toBeTruthy()
  })
})

const ABANDON23: WalletData = {
  version: "v1",
  type: WalletType.MNEMONIC_UNPROTECTED,
  raw: "408b285c123836004f4b8842c89324c1f01382450c0d439af345ba7fc49acf705489c6fc77dbd4e3dc1dd8cc6bc9f043db8ada1e243c4a0eafb290d399480840"
}

it('should load account 0 with withTransactionBuilder', async () => {
  getItem
    .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground)
    .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground)
    .mockResolvedValueOnce(JSON.stringify([ABANDON23]))

  const { result } = renderHook(() => useCachedWallets())
  await waitFor(() => {
    expect(result).toBeTruthy()
  })

  expect(getWallet(0).get(0).withTransactionBuilder().utxo).toBeDefined()
  expect(getWallet(0).get(0).withTransactionBuilder().dex).toBeDefined()
  expect(getWallet(0).get(0).withTransactionBuilder().account).toBeDefined()
  expect(getWallet(0).get(0).withTransactionBuilder().liqPool).toBeDefined()
});

it('should load LocalPlayground with (abandon x23) with expected keys', async () => {
  getItem
    .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground)
    .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground)
    .mockResolvedValueOnce(JSON.stringify([ABANDON23]))

  const { result } = renderHook(() => useCachedWallets())
  await waitFor(() => {
    expect(result).toBeTruthy()
  })

  expect(getWallet(0)).toBeDefined()
  expect(await getWallet(0).get(0).getAddress()).toStrictEqual('bcrt1qynxwmwauztnzzar2nddh8hyhe3l7v5p3f7dn4c')
  expect(await getWallet(0).get(0).getScript()).toStrictEqual({
    stack: [
      OP_CODES.OP_0,
      OP_CODES.OP_PUSHDATA_HEX_LE('24ccedbbbc12e621746a9b5b73dc97cc7fe65031'),
    ]
  })

  expect(await getWallet(0).get(1).getAddress()).toStrictEqual('bcrt1q4qv0q69rzfqy5wc74wpjgu0y2u9jyyggrrx3gn')
  expect(await getWallet(0).get(1).getScript()).toStrictEqual({
    stack: [
      OP_CODES.OP_0,
      OP_CODES.OP_PUSHDATA_HEX_LE('a818f068a312404a3b1eab832471e4570b221108'),
    ]
  })
})

it('should load RemotePlayground with (abandon x23) with expected keys', async () => {
  getItem
    .mockResolvedValueOnce(EnvironmentNetwork.RemotePlayground)
    .mockResolvedValueOnce(EnvironmentNetwork.RemotePlayground)
    .mockResolvedValueOnce('408b285c123836004f4b8842c89324c1f01382450c0d439af345ba7fc49acf705489c6fc77dbd4e3dc1dd8cc6bc9f043db8ada1e243c4a0eafb290d399480840')

  const { result } = renderHook(() => useCachedWallets())
  await waitFor(() => {
    expect(result).toBeTruthy()
  })

  expect(getWallet(0)).toBeDefined()
  expect(await getWallet(0).get(0).getAddress()).toStrictEqual('bcrt1qynxwmwauztnzzar2nddh8hyhe3l7v5p3f7dn4c')
  expect(await getWallet(0).get(1).getAddress()).toStrictEqual('bcrt1q4qv0q69rzfqy5wc74wpjgu0y2u9jyyggrrx3gn')
})

it('should fail without having any seed stored', async () => {
  getItem
    .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground)
    .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground)
    .mockResolvedValueOnce("[]")

  const { result } = renderHook(() => useCachedWallets())
  await waitFor(() => {
    expect(result).toBeTruthy()
  })

  expect(getWallets().length).toStrictEqual(0)
})
