import {
  EncryptedHdNodeProvider,
  EncryptedProviderData,
  PrivateKeyEncryption,
  PromptPassphrase,
  Scrypt
} from '@defichain/jellyfish-wallet-encrypted'
import * as Random from 'expo-random'
import { EnvironmentNetwork } from '../../../environment'
import { getBip32Option } from '../network'
import { WalletPersistenceData, WalletType } from '../persistence'

const encryption = new PrivateKeyEncryption(new Scrypt(), numOfBytes => {
  const bytes = Random.getRandomBytes(numOfBytes)
  return Buffer.from(bytes)
})

interface PromptInterface {
  prompt: PromptPassphrase
}

function initProvider (
  data: WalletPersistenceData<EncryptedProviderData>,
  network: EnvironmentNetwork,
  promptInterface: PromptInterface
): EncryptedHdNodeProvider {
  if (data.type !== WalletType.MNEMONIC_ENCRYPTED || data.version !== 'v1') {
    throw new Error('Unexpected WalletPersistenceData')
  }

  const bip32Options = getBip32Option(network)
  return EncryptedHdNodeProvider.init(data.raw, bip32Options, encryption, async () => {
    return await promptInterface.prompt()
  })
}

async function toData (mnemonic: string[], network: EnvironmentNetwork, passphrase: string): Promise<WalletPersistenceData<EncryptedProviderData>> {
  const options = getBip32Option(network)
  const data = await EncryptedHdNodeProvider.wordsToEncryptedData(mnemonic, options, encryption, passphrase)

  return {
    version: 'v1',
    type: WalletType.MNEMONIC_ENCRYPTED,
    raw: data
  }
}

export const MnemonicEncrypted = {
  initProvider,
  toData,
  /**
   * Convenience Abandon23 Art on Playground Network Data
   */
  Abandon23Playground: toData([
    'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'art'
  ], EnvironmentNetwork.LocalPlayground, '123456')
}
