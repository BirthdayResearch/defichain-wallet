import { EncryptedHdNodeProvider, EncryptedProviderData, PromptPassphrase } from '@defichain/jellyfish-wallet-encrypted'
import { EnvironmentNetwork } from '../../../environment'
import { scrypt } from '../../scrypt'
import { getBip32Option } from '../network'
import { WalletPersistenceData, WalletType } from '../persistence'

export interface PromptInterface {
  prompt: PromptPassphrase
}

function initProvider (
  data: WalletPersistenceData<EncryptedProviderData>,
  network: EnvironmentNetwork,
  promptInterface?: PromptInterface // must allow construction/new for every prompt
): EncryptedHdNodeProvider {
  if (data.type !== WalletType.MNEMONIC_ENCRYPTED || data.version !== 'v1') {
    throw new Error('Unexpected WalletPersistenceData')
  }

  const options = getBip32Option(network)
  return EncryptedHdNodeProvider.init(data.raw, options, scrypt, async () => {
    if (promptInterface === undefined) return '' // before OceanInterface bridged the UI
    return await promptInterface.prompt()
  })
}

async function toData (mnemonic: string[], network: EnvironmentNetwork, passphrase: string): Promise<WalletPersistenceData<EncryptedProviderData>> {
  const options = getBip32Option(network)
  const data = await EncryptedHdNodeProvider.wordsToEncryptedData(mnemonic, options, scrypt, passphrase)

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
