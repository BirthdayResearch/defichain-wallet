import * as ExpoSecureStore from 'expo-secure-store'
import { EnvironmentNetwork } from '@environment'
import { WalletPersistence } from './persistence'
import { WalletType } from '@shared-contexts/WalletPersistenceContext'

// TODO(fuxingloh): 'jest-expo' only test native (provider.native.ts) by default, need to improve testing capability

const getItem = jest.spyOn(ExpoSecureStore, 'getItemAsync')
const setItem = jest.spyOn(ExpoSecureStore, 'setItemAsync')
const removeItem = jest.spyOn(ExpoSecureStore, 'deleteItemAsync')

beforeEach(() => {
  jest.clearAllMocks()
})

describe('WalletPersistence.get()', () => {
  it('should throw error if fail to retrieve any wallet', async () => {
    getItem
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground)
      .mockResolvedValueOnce('1')
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground)
      .mockResolvedValueOnce(null)

    await (expect(WalletPersistence.get()).rejects.toThrowError(`WALLET.count=${1} but 0 doesn't exist`))
  })

  it('should get empty', async () => {
    getItem
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground)
      .mockResolvedValueOnce('0')

    const items = await WalletPersistence.get()
    expect(items.length).toStrictEqual(0)

    expect(getItem).toBeCalledWith('Development.NETWORK')
    expect(getItem).toBeCalledWith('Development.Local.WALLET.count')
  })

  it('should get non empty', async () => {
    getItem
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground)
      .mockResolvedValueOnce('1')
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground)
      .mockResolvedValueOnce(JSON.stringify({ raw: 'raw-1', type: WalletType.MNEMONIC_UNPROTECTED, version: 'v1' }))

    const items = await WalletPersistence.get()
    expect(items.length).toStrictEqual(1)
    expect(items).toStrictEqual(
      [{ raw: 'raw-1', type: WalletType.MNEMONIC_UNPROTECTED, version: 'v1' }]
    )
  })
})

describe('WalletPersistence.set()', () => {
  it('should set 0 wallet, clear 0 wallet', async () => {
    getItem
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground) // get WALLET.count (network)
      .mockResolvedValueOnce('0')
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground) // set WALLET.count (network)

    await WalletPersistence.set([])

    expect(getItem).toBeCalledTimes(3)
    expect(setItem).toBeCalledWith('Development.Local.WALLET.count', '0')
  })

  it('should set 1 wallet, clear 0 wallet', async () => {
    getItem
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground) // get WALLET.count (network)
      .mockResolvedValueOnce('0')
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground) // set WALLET.0 (network)
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground) // set WALLET.count (network)

    await WalletPersistence.set([
      { raw: 'raw-1', type: WalletType.MNEMONIC_UNPROTECTED, version: 'v1' }
    ])

    expect(getItem).toBeCalledTimes(4)
    expect(setItem).toBeCalledWith('Development.Local.WALLET.0',
      JSON.stringify({ raw: 'raw-1', type: WalletType.MNEMONIC_UNPROTECTED, version: 'v1' })
    )
    expect(setItem).toBeCalledWith('Development.Local.WALLET.count', '1')
  })

  it('should set 1 wallet, clear 1 wallet', async () => {
    getItem
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground) // get WALLET.count (network)
      .mockResolvedValueOnce('1')
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground) // remove WALLET.0 (network)
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground) // set WALLET.0 (network)
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground) // set WALLET.count (network)

    await WalletPersistence.set([
      { raw: 'raw-1', type: WalletType.MNEMONIC_UNPROTECTED, version: 'v1' }
    ])

    expect(getItem).toBeCalledTimes(5)
    expect(removeItem).toBeCalledWith('Development.Local.WALLET.0')

    expect(setItem).toBeCalledWith('Development.Local.WALLET.0',
      JSON.stringify({ raw: 'raw-1', type: WalletType.MNEMONIC_UNPROTECTED, version: 'v1' })
    )
    expect(setItem).toBeCalledWith('Development.Local.WALLET.count', '1')
  })

  it('should set 1 wallet, clear 3 wallet', async () => {
    getItem
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground) // get WALLET.count (network)
      .mockResolvedValueOnce('3')
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground) // remove WALLET.0 (network)
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground) // remove WALLET.2 (network)
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground) // remove WALLET.3 (network)
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground) // set WALLET.0 (network)
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground) // set WALLET.count (network)

    await WalletPersistence.set([
      { raw: 'raw-1', type: WalletType.MNEMONIC_UNPROTECTED, version: 'v1' }
    ])

    expect(getItem).toBeCalledTimes(7)
    expect(removeItem).toBeCalledWith('Development.Local.WALLET.0')
    expect(removeItem).toBeCalledWith('Development.Local.WALLET.1')
    expect(removeItem).toBeCalledWith('Development.Local.WALLET.2')

    expect(setItem).toBeCalledWith('Development.Local.WALLET.0',
      JSON.stringify({ raw: 'raw-1', type: WalletType.MNEMONIC_UNPROTECTED, version: 'v1' })
    )
    expect(setItem).toBeCalledWith('Development.Local.WALLET.count', '1')
  })

  it('should set 2 wallet, clear 0 wallet', async () => {
    getItem
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground) // get WALLET.count (network)
      .mockResolvedValueOnce('0')
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground) // set WALLET.0 (network)
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground) // set WALLET.1 (network)
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground) // set WALLET.count (network)

    await WalletPersistence.set([
      { raw: 'raw-1', type: WalletType.MNEMONIC_UNPROTECTED, version: 'v1' },
      { raw: 'raw-2', type: WalletType.MNEMONIC_UNPROTECTED, version: 'v1' }
    ])

    expect(getItem).toBeCalledTimes(5)

    expect(setItem).toBeCalledWith('Development.Local.WALLET.0',
      JSON.stringify({ raw: 'raw-1', type: WalletType.MNEMONIC_UNPROTECTED, version: 'v1' })
    )
    expect(setItem).toBeCalledWith('Development.Local.WALLET.1',
      JSON.stringify({ raw: 'raw-2', type: WalletType.MNEMONIC_UNPROTECTED, version: 'v1' })
    )
    expect(setItem).toBeCalledWith('Development.Local.WALLET.count', '2')
  })

  it('should set 2 wallet, clear 1 wallet', async () => {
    getItem
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground) // get WALLET.count (network)
      .mockResolvedValueOnce('1')
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground) // remove WALLET.0 (network)
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground) // set WALLET.0 (network)
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground) // set WALLET.1 (network)
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground) // set WALLET.count (network)

    await WalletPersistence.set([
      { raw: 'raw-1', type: WalletType.MNEMONIC_UNPROTECTED, version: 'v1' },
      { raw: 'raw-2', type: WalletType.MNEMONIC_UNPROTECTED, version: 'v1' }
    ])

    expect(getItem).toBeCalledTimes(6)

    expect(removeItem).toBeCalledWith('Development.Local.WALLET.0')

    expect(setItem).toBeCalledWith('Development.Local.WALLET.0',
      JSON.stringify({ raw: 'raw-1', type: WalletType.MNEMONIC_UNPROTECTED, version: 'v1' })
    )
    expect(setItem).toBeCalledWith('Development.Local.WALLET.1',
      JSON.stringify({ raw: 'raw-2', type: WalletType.MNEMONIC_UNPROTECTED, version: 'v1' })
    )
    expect(setItem).toBeCalledWith('Development.Local.WALLET.count', '2')
  })

  it('should set 3 wallet, clear 3 wallet', async () => {
    getItem
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground) // get WALLET.count (network)
      .mockResolvedValueOnce('3')
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground) // remove WALLET.0 (network)
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground) // remove WALLET.2 (network)
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground) // remove WALLET.3 (network)
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground) // set WALLET.0 (network)
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground) // set WALLET.1 (network)
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground) // set WALLET.2 (network)
      .mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground) // set WALLET.count (network)

    await WalletPersistence.set([
      { raw: 'raw-1', type: WalletType.MNEMONIC_UNPROTECTED, version: 'v1' },
      { raw: 'raw-2', type: WalletType.MNEMONIC_UNPROTECTED, version: 'v1' },
      { raw: 'raw-3', type: WalletType.MNEMONIC_UNPROTECTED, version: 'v1' }
    ])

    expect(getItem).toBeCalledTimes(9)
    expect(removeItem).toBeCalledWith('Development.Local.WALLET.0')
    expect(removeItem).toBeCalledWith('Development.Local.WALLET.1')
    expect(removeItem).toBeCalledWith('Development.Local.WALLET.2')

    expect(setItem).toBeCalledWith('Development.Local.WALLET.0',
      JSON.stringify({ raw: 'raw-1', type: WalletType.MNEMONIC_UNPROTECTED, version: 'v1' })
    )
    expect(setItem).toBeCalledWith('Development.Local.WALLET.1',
      JSON.stringify({ raw: 'raw-2', type: WalletType.MNEMONIC_UNPROTECTED, version: 'v1' })
    )
    expect(setItem).toBeCalledWith('Development.Local.WALLET.2',
      JSON.stringify({ raw: 'raw-3', type: WalletType.MNEMONIC_UNPROTECTED, version: 'v1' })
    )
    expect(setItem).toBeCalledWith('Development.Local.WALLET.count', '3')
  })
})
