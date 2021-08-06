import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import { block } from './block'
import { ocean } from './ocean'
import { transactionQueue } from './transaction_queue'
import { wallet } from './wallet'

/**
 * RootState for DeFi Wallet App
 *
 * All state reducer in this store must be designed for global use and placed in this
 * directory as such. Reducer that are not meant to be global must not be part of
 * RootState.
 *
 * Non-global state should be managed independently within its own React Component.
 */
export const createStore =
  /* eslint-disable @typescript-eslint/explicit-function-return-type */
  () => configureStore({
    reducer: {
      block: block.reducer,
      wallet: wallet.reducer,
      ocean: ocean.reducer,
      transactionQueue: transactionQueue.reducer
    },
    middleware: [
      ...getDefaultMiddleware({ serializableCheck: false })
    ]
  })

export type RootState = ReturnType<ReturnType<typeof createStore>['getState']>
