import { MnemonicStorage } from './mnemonic_storage'

describe('EncryptedMnemonicStorage', () => {
  function generateText (length: number, sequence: string): string {
    let text = ''
    for (let i = 0; i < length; i++) {
      text += sequence
    }
    return text
  }

  it('should throw error when failed to retrieve encrypted value from secure store', async () => {
    const text = generateText(2047, '0')
    await expect(MnemonicStorage.get(text)).rejects.toThrowError('NO_MNEMONIC_BACKUP')
  })
})
