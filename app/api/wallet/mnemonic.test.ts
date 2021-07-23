import { EnvironmentNetwork } from "../../environment";
import { Mnemonic } from "./mnemonic";
import { WalletData, WalletType } from "./persistence";

beforeEach(() => {
  jest.clearAllMocks()
})

describe('getMnemonicHdNodeProvider', () => {
  it('should get provider (abandon x23)', async () => {
    const data: WalletData = {
      version: "v1",
      type: WalletType.MNEMONIC_UNPROTECTED,
      raw: JSON.stringify({
        words: ['abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'art'],
        chainCode: 'f40eaad21641ca7cb5ac00f9ce21cac9ba070bb673a237f7bce57acda54386a4',
        privKey: '235b34cd7c9f6d7e4595ffe9ae4b1cb5606df8aca2b527d20a07c8f56b2342f4'
      })
    }
    const options = EnvironmentNetwork.LocalPlayground

    const provider = Mnemonic.createProvider(data, options)
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
    expect(Mnemonic.createWalletDataAbandon23(EnvironmentNetwork.LocalPlayground)).toStrictEqual({
      version: "v1",
      type: WalletType.MNEMONIC_UNPROTECTED,
      raw: JSON.stringify({
        words: ['abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'art'],
        chainCode: 'f40eaad21641ca7cb5ac00f9ce21cac9ba070bb673a237f7bce57acda54386a4',
        privKey: '235b34cd7c9f6d7e4595ffe9ae4b1cb5606df8aca2b527d20a07c8f56b2342f4'
      })
    })
  })

  it('should set mnemonic (void come effort ...)', async () => {
    const mnemonic = 'void come effort suffer camp survey warrior heavy shoot primary clutch crush open amazing screen patrol group space point ten exist slush involve unfold'.split(' ')

    expect(Mnemonic.createWalletData(mnemonic, EnvironmentNetwork.LocalPlayground)).toStrictEqual({
      version: "v1",
      type: WalletType.MNEMONIC_UNPROTECTED,
      raw: JSON.stringify({
        words: ['void', 'come', 'effort', 'suffer', 'camp', 'survey', 'warrior', 'heavy', 'shoot', 'primary', 'clutch', 'crush', 'open', 'amazing', 'screen', 'patrol', 'group', 'space', 'point', 'ten', 'exist', 'slush', 'involve', 'unfold'],
        chainCode: 'bbb5f26acee2e3713d43cf4e702f2b1ff8672afa9e0d5ac846196689e1d893d2',
        privKey: 'b21fcb414b4414e9bcf7ae647a79a4d29280f6b71cba204cb4dd3d6c6568d0fc'
      })
    })
  })
})
