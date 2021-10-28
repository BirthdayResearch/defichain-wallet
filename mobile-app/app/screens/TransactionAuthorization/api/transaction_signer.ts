import { DfTxSigner } from '@store/transaction_queue'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { CTransactionSegWit } from '@defichain/jellyfish-transaction'
import { Authentication } from '@store/authentication'
import { WalletAlert } from '@components/WalletAlert'
import { translate } from '@translations'
import { INVALID_HASH, MAX_PASSCODE_ATTEMPT } from '@screens/TransactionAuthorization/api/transaction_types'
import { NativeLoggingProps } from '@shared-contexts/NativeLoggingProvider'

export async function execWithAutoRetries (promptPromise: () => Promise<any>, onAutoRetry: (attempts: number) => Promise<void>, retries: number = 0, logger: NativeLoggingProps): Promise<any> {
  try {
    return await promptPromise()
  } catch (e: any) {
    logger.error(e)
    if (e.message === INVALID_HASH && ++retries < MAX_PASSCODE_ATTEMPT) {
      await onAutoRetry(retries)
      return await execWithAutoRetries(promptPromise, onAutoRetry, retries, logger)
    }
    throw e
  }
}

// store/transactionQueue execution
export async function signTransaction (tx: DfTxSigner, account: WhaleWalletAccount, onAutoRetry: (attempts: number) => Promise<void>, retries: number = 0, logger: NativeLoggingProps): Promise<CTransactionSegWit> {
  return await execWithAutoRetries(async () => (await tx.sign(account)), onAutoRetry, retries, logger)
}

// store/authentication execution
export async function authenticateFor<T> (
  promptPassphrase: () => Promise<string>,
  authentication: Authentication<T>,
  onAutoRetry: (attempts: number) => Promise<void>,
  retries: number = 0,
  logger: NativeLoggingProps
): Promise<void> {
  const customJob = async (): Promise<void> => {
    const passphrase = await promptPassphrase()
    const result = await authentication.consume(passphrase)
    return await authentication.onAuthenticated(result)
  }

  return await execWithAutoRetries(customJob, onAutoRetry, retries, logger)
}

export function alertUnlinkWallet (): void {
  WalletAlert({
    title: translate('screens/PinConfirmation', 'Wallet Unlinked'),
    message: translate('screens/PinConfirmation', 'Your wallet was unlinked for your safety due to successive passcode failures. Please use recovery words to restore and set up your wallet again.'),
    buttons: [
      {
        text: translate('screens/PinConfirmation', 'Close'),
        style: 'destructive'
      }
    ]
  })
}
