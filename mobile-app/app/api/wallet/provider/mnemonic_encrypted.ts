import {
  EncryptedHdNodeProvider,
  EncryptedProviderData,
  PrivateKeyEncryption,
  PromptPassphrase,
  Scrypt
} from '@defichain/jellyfish-wallet-encrypted'
import { getRandomBytes } from 'expo-random'
import { EnvironmentNetwork } from '@environment'
import { getBip32Option } from '@shared-api/wallet/network'
import { WalletPersistenceDataI, WalletType } from '@shared-contexts/WalletPersistenceContext'

// BIP38 default, 16k, 8, 8
const DEFAULT_SCRYPT_N_R_P = [
  Math.pow(2, 9),
  8, // decide stress on ram, not to reduce, to remained strong POW
  2 // iteration, directly stack up time (if only purely single thread)
]

/**
 * Benchmarked using samsung s8 (adb linked, which is really slow)
 * -----|---|---|---------|--------
 * N    | r | p | encrypt | sign tx
 * -----|---|---|---------|--------
 * 2^14 | 8 | 8 | 199433  | 218643
 * 2^11 | 8 | 8 | 17086   | 23299
 * 2^11 | 8 | 1 | 3692    | 9137
 * 2^11 | 1 | 8 | 3694    | 8603
 * 2^11 | 1 | 1 | 2001    | 7231
 * 2^11 | 4 | 1 | 2949    | 7624
 * 2^12 | 4 | 4 | 2962    | 8277
 *
 * 2^11 | 8 | 8 | 19491   | 29512
 * 2^14 | 8 | 1 | 26615   | 30331
 * 2^11 | 4 | 8 | 8926    | 14117
 */
const encryption = new PrivateKeyEncryption(new Scrypt(...DEFAULT_SCRYPT_N_R_P), numOfBytes => {
  const bytes = getRandomBytes(numOfBytes)
  return Buffer.from(bytes)
})

interface PromptInterface {
  prompt: PromptPassphrase
}

function initProvider (
  data: WalletPersistenceDataI<EncryptedProviderData>,
  network: EnvironmentNetwork,
  promptInterface: PromptInterface
): EncryptedHdNodeProvider {
  if (data.type !== WalletType.MNEMONIC_ENCRYPTED || data.version !== 'v1') {
    throw new Error('Unexpected WalletPersistenceDataI')
  }

  const bip32Options = getBip32Option(network)
  return EncryptedHdNodeProvider.init(data.raw, bip32Options, encryption, async () => {
    return await promptInterface.prompt()
  })
}

async function toData (mnemonic: string[], network: EnvironmentNetwork, passphrase: string): Promise<WalletPersistenceDataI<EncryptedProviderData>> {
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
  toData
}
