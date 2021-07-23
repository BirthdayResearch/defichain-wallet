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
    raw: "408b285c123836004f4b8842c89324c1f01382450c0d439af345ba7fc49acf705489c6fc77dbd4e3dc1dd8cc6bc9f043db8ada1e243c4a0eafb290d399480840"
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
