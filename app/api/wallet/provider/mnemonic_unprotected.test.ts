import { MnemonicProviderData } from "@defichain/jellyfish-wallet-mnemonic";
import { EnvironmentNetwork } from "../../../environment";
import { WalletPersistenceData, WalletType } from "../persistence";
import { MnemonicUnprotected } from "./mnemonic_unprotected";

beforeEach(() => {
  jest.clearAllMocks()
})

describe('getMnemonicHdNodeProvider', () => {
  it('should get provider (abandon x23)', async () => {
    const data: WalletPersistenceData<MnemonicProviderData> = {
      version: "v1",
      type: WalletType.MNEMONIC_UNPROTECTED,
      raw: {
        words: ['abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'art'],
        privKey: '235b34cd7c9f6d7e4595ffe9ae4b1cb5606df8aca2b527d20a07c8f56b2342f4',
        chainCode: 'f40eaad21641ca7cb5ac00f9ce21cac9ba070bb673a237f7bce57acda54386a4'
      }
    }
    const options = EnvironmentNetwork.LocalPlayground

    const provider = MnemonicUnprotected.initProvider(data, options)
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
    const data = MnemonicUnprotected.toData([
      'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'art'
    ], EnvironmentNetwork.LocalPlayground)

    expect(data).toStrictEqual({
      version: "v1",
      type: WalletType.MNEMONIC_UNPROTECTED,
      raw: {
        words: ['abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'art'],
        privKey: '5237699220ac42181ec13168534b56aaad0b812ef09dc6427660ae89bbebaa7c',
        chainCode: '276c385797e9a2018cbc10e769f137198dd94719670ec0e5df3ea69385a33229'
      }
    })
  })

  it('should set mnemonic (void come effort ...)', async () => {
    const words = 'void come effort suffer camp survey warrior heavy shoot primary clutch crush open amazing screen patrol group space point ten exist slush involve unfold'.split(' ')

    expect(MnemonicUnprotected.toData(words, EnvironmentNetwork.LocalPlayground)).toStrictEqual({
      version: "v1",
      type: WalletType.MNEMONIC_UNPROTECTED,
      raw: {
        words: words,
        privKey: 'f97bae97aa293a5d5d62765684efe281e783aa927899c97c61a9ead3953286c3',
        chainCode: '67537da3836a1566399151c71e5e4e92e93386921748701bb66417cbb663c799'
      }
    })
  })
})
