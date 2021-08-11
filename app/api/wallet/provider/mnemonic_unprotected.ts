import { MnemonicHdNodeProvider, MnemonicProviderData } from '@defichain/jellyfish-wallet-mnemonic'
import { EnvironmentNetwork } from '../../../environment'
import { getBip32Option } from '../network'
import { WalletPersistenceData, WalletType } from '../persistence'

function initProvider (data: WalletPersistenceData<MnemonicProviderData>, network: EnvironmentNetwork): MnemonicHdNodeProvider {
  if (data.type !== WalletType.MNEMONIC_UNPROTECTED || data.version !== 'v1') {
    throw new Error('Unexpected WalletPersistenceData')
  }

  const options = getBip32Option(network)
  return MnemonicHdNodeProvider.fromData(data.raw, options)
}

function toData (mnemonic: string[], network: EnvironmentNetwork): WalletPersistenceData<MnemonicProviderData> {
  const options = getBip32Option(network)
  const data = MnemonicHdNodeProvider.wordsToData(mnemonic, options)

  return {
    version: 'v1',
    type: WalletType.MNEMONIC_UNPROTECTED,
    raw: data
  }
}

export const MnemonicUnprotected = {
  initProvider,
  toData
}
