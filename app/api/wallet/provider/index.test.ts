import { MnemonicProviderData } from "@defichain/jellyfish-wallet-mnemonic";
import { WhaleApiClient } from "@defichain/whale-api-client";
import { EnvironmentNetwork } from "../../../environment";
import { WalletPersistenceData, WalletType } from "../persistence";
import { initWhaleWallet } from "./index";

beforeEach(async () => {
  jest.clearAllMocks()
})

const network = EnvironmentNetwork.LocalPlayground
const client = new WhaleApiClient({ url: 'http://localhost:19553', network: 'regtest' })

it('should initWhaleWallet', async () => {
  const data: WalletPersistenceData<MnemonicProviderData> = {
    version: "v1",
    type: WalletType.MNEMONIC_UNPROTECTED,
    raw: {
      words: ['abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'art'],
      privKey: '235b34cd7c9f6d7e4595ffe9ae4b1cb5606df8aca2b527d20a07c8f56b2342f4',
      chainCode: 'f40eaad21641ca7cb5ac00f9ce21cac9ba070bb673a237f7bce57acda54386a4'
    }
  }

  const wallet = initWhaleWallet(data, network, client)

  expect(wallet.get(0).withTransactionBuilder().utxo).toBeDefined()
  expect(wallet.get(0).withTransactionBuilder().dex).toBeDefined()
  expect(wallet.get(0).withTransactionBuilder().account).toBeDefined()
  expect(wallet.get(0).withTransactionBuilder().liqPool).toBeDefined()
});


it('should fail as wallet type not available', async () => {
  const data: WalletPersistenceData<string> = {
    version: "v1",
    type: undefined as any,
    raw: ""
  }

  expect(() => {
    initWhaleWallet(data, network, client)
  }).toThrow('wallet undefined not available')
})
