import { MnemonicStorage } from './mnemonic_storage'

describe('EncryptedMnemonicStorage', () => {
  it('should throw error when failed to retrieve entropy from secure store', async () => {
    await expect(MnemonicStorage.get('foo')).rejects.toThrowError('NO_MNEMONIC_BACKUP')
  })
})
