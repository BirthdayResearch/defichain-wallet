/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import { authentication } from './authentication'
import { block } from './block'
import { ocean } from './ocean'
import { transactionQueue } from './transaction_queue'
import { txidNotification } from './transaction_notification'
import { wallet } from './wallet'

/**
 * RootState for DeFiChain Wallet App
 *
 * All state reducer in this store must be designed for global use and placed in this
 * directory as such. Reducer that are not meant to be global must not be part of
 * RootState.
 *
 * Non-global state should be managed independently within its own React Component.
 */
export function initializeStore () {
  return configureStore({
    reducer: {
      block: block.reducer,
      wallet: wallet.reducer,
      ocean: ocean.reducer,
      transactionQueue: transactionQueue.reducer,
      authentication: authentication.reducer,
      txidNotification: txidNotification.reducer
    },
    middleware: [
      ...getDefaultMiddleware({ serializableCheck: false })
    ]
  })
}

export type RootStore = ReturnType<typeof initializeStore>
export type RootState = ReturnType<RootStore['getState']>
