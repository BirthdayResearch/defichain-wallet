export const MAX_PASSCODE_ATTEMPT = 3 // allowed 2 failures
export const PASSCODE_LENGTH = 6
export const TRY_AGAIN_TIMER_COUNT = 10
export const INVALID_HASH = 'invalid hash'
export const USER_CANCELED = 'USER_CANCELED'
export const UNEXPECTED_FAILURE = 'UNEXPECTED_FAILURE'

export const DEFAULT_MESSAGES = {
  message: 'Enter passcode to continue',
  loadingMessage: 'Signing your transaction...',
  authorizedTransactionMessage: {
    title: 'Transaction signed',
    description: 'Your wallet is your responsibility, do not forget to store your 24 recovery words.'
  },
  grantedAccessMessage: {
    title: 'Success!',
    description: ''
  }
}

export const SUCCESS_DISPLAY_TIMEOUT_IN_MS = 2000
export const CANCELED_ERROR = 'canceled error'

export enum TransactionStatus {
  INIT,
  IDLE,
  BLOCK,
  PIN,
  SIGNING,
  AUTHORIZED
}

export interface PromptPromiseI {
  resolve: (pin: string) => void
  reject: (e: Error) => void
}
