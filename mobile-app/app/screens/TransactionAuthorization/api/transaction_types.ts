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
    title: 'Transaction authorized',
    description: 'Please wait while your transaction is being prepared'
  },
  grantedAccessMessage: {
    title: 'Access granted',
    description: 'You may now proceed'
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
