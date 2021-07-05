import AsyncStorage from "@react-native-async-storage/async-storage";
import { EnvironmentNetwork } from "../environment";
import { addMnemonicHdNodeProvider, getMnemonicHdNodeProvider } from "./mnemonic";
import { WalletData, WalletType } from "./persistence";

const getItem = jest.spyOn(AsyncStorage, 'getItem')
const setItem = jest.spyOn(AsyncStorage, 'setItem')

beforeEach(() => {
  jest.clearAllMocks()
})

const ABANDON23: WalletData = {
  version: "v1",
  type: WalletType.MNEMONIC_UNPROTECTED,
  raw: "408b285c123836004f4b8842c89324c1f01382450c0d439af345ba7fc49acf705489c6fc77dbd4e3dc1dd8cc6bc9f043db8ada1e243c4a0eafb290d399480840"
}

describe('getMnemonicHdNodeProvider', () => {
  it('should get provider (abandon x23)', async () => {
    getItem.mockResolvedValueOnce(EnvironmentNetwork.LocalPlayground)

    const provider = await getMnemonicHdNodeProvider(ABANDON23)
    expect(provider).toBeTruthy()

    const node = provider.derive('0')
    const pubKey = await node.publicKey()
    const privKey = await node.privateKey()

    expect(pubKey.toString('hex')).toStrictEqual('03f85401f5aa4e9ed831120a22b8835137404755b30c59109c18c706b2549f7951')
    expect(privKey.toString('hex')).toStrictEqual('da44d2b30836e1ca7c38b2b32fb5f62e07209364248e8a3eb86ffa2aa2ff3af1')
  })
})

describe('addMnemonicHdNodeProvider', () => {
  it('should set mnemonic (abandon x23)', async () => {
    const mnemonic = ['abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'art']
    await addMnemonicHdNodeProvider(mnemonic)

    expect(setItem).toBeCalledWith(
      'Development.Local Playground.WALLET',
      JSON.stringify([ABANDON23])
    )
  })

  it('should set mnemonic (void come effort ...)', async () => {
    getItem.mockResolvedValueOnce(EnvironmentNetwork.RemotePlayground)

    const mnemonic = 'void come effort suffer camp survey warrior heavy shoot primary clutch crush open amazing screen patrol group space point ten exist slush involve unfold'.split(' ')
    await addMnemonicHdNodeProvider(mnemonic)

    expect(setItem).toBeCalledWith(
      'Development.Local Playground.WALLET',
      JSON.stringify([{
        version: "v1",
        type: WalletType.MNEMONIC_UNPROTECTED,
        raw: 'b873212f885ccffbf4692afcb84bc2e55886de2dfa07d90f5c3c239abc31c0a6ce047e30fd8bf6a281e71389aa82d73df74c7bbfb3b06b4639a5cee775cccd3c'
      }])
    )
  })
})
