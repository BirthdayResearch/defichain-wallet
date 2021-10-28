import {
  generateMnemonicWords,
  MnemonicHdNodeProvider,
  MnemonicProviderData
} from '@defichain/jellyfish-wallet-mnemonic'
import { getRandomBytes } from 'expo-random'
import { EnvironmentNetwork } from '@environment'
import { getBip32Option } from '@shared-api/wallet/network'
import { WalletPersistenceDataI, WalletType } from '@shared-contexts/WalletPersistenceContext'

function initProvider (data: WalletPersistenceDataI<MnemonicProviderData>, network: EnvironmentNetwork): MnemonicHdNodeProvider {
  if (data.type !== WalletType.MNEMONIC_UNPROTECTED || data.version !== 'v1') {
    throw new Error('Unexpected WalletPersistenceDataI')
  }

  const options = getBip32Option(network)
  return MnemonicHdNodeProvider.fromData(data.raw, options)
}

function toData (mnemonic: string[], network: EnvironmentNetwork): WalletPersistenceDataI<MnemonicProviderData> {
  const options = getBip32Option(network)
  const data = MnemonicHdNodeProvider.wordsToData(mnemonic, options)

  return {
    version: 'v1',
    type: WalletType.MNEMONIC_UNPROTECTED,
    raw: data
  }
}

function generateWords (): string[] {
  return generateMnemonicWords(24, numOfBytes => {
    const bytes = getRandomBytes(numOfBytes)
    return Buffer.from(bytes)
  })
}

export const MnemonicUnprotected = {
  initProvider,
  toData,
  generateWords
}
