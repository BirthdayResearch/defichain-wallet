import { WhaleApiClient } from "@defichain/whale-api-client";
import { WhaleWalletAccountProvider } from "@defichain/whale-api-wallet";
import { EnvironmentNetwork } from "../../environment";
import { createWallet } from "./index";
import { getJellyfishNetwork } from "./network";
import { WalletData, WalletType } from "./persistence";

beforeEach(async () => {
  jest.clearAllMocks()
})

const network = EnvironmentNetwork.LocalPlayground
const client = new WhaleApiClient({ url: 'http://localhost:19553', network: 'regtest' })
const options = getJellyfishNetwork(network)
const provider = new WhaleWalletAccountProvider(client, options)

it('should createWallet', async () => {
  const data: WalletData = {
    version: "v1",
    type: WalletType.MNEMONIC_UNPROTECTED,
    raw: JSON.stringify([
      '235b34cd7c9f6d7e4595ffe9ae4b1cb5606df8aca2b527d20a07c8f56b2342f4', // root priv key
      'f40eaad21641ca7cb5ac00f9ce21cac9ba070bb673a237f7bce57acda54386a4' // chain code
    ])
  }

  const wallet = createWallet(data, network, provider)

  expect(wallet.get(0).withTransactionBuilder().utxo).toBeDefined()
  expect(wallet.get(0).withTransactionBuilder().dex).toBeDefined()
  expect(wallet.get(0).withTransactionBuilder().account).toBeDefined()
  expect(wallet.get(0).withTransactionBuilder().liqPool).toBeDefined()
});


it('should fail as wallet type not available', async () => {
  const data: WalletData = {
    version: "v1",
    type: undefined as any,
    raw: ""
  }

  expect(() => {
    createWallet(data, network, provider)
  }).toThrow('wallet undefined not available')
})
