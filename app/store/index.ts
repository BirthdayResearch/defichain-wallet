import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import { block } from './block'
import { ocean } from './ocean'
import { wallet } from './wallet'
import { transactionQueue } from './transaction'

/**
 * RootState for DeFi Wallet App
 *
 * All state reducer in this store must be designed for global use and placed in this
 * directory as such. Reducer that are not meant to be global must not be part of
 * RootState.
 *
 * Non-global state should be managed independently within its own React Component.
 */
export const store = configureStore({
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

export type RootState = ReturnType<typeof store.getState>
