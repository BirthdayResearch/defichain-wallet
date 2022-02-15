/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { configureStore } from '@reduxjs/toolkit'
import { authentication } from './authentication'
import { block } from './block'
import { ocean } from './ocean'
import { transactionQueue } from './transaction_queue'
import { wallet } from './wallet'
import { loans } from './loans'
import { auctions } from './auctions'
import { announcementWebsiteSlice, statusWebsiteSlice } from '@store/website'

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
      loans: loans.reducer,
      auctions: auctions.reducer,
      ocean: ocean.reducer,
      transactionQueue: transactionQueue.reducer,
      authentication: authentication.reducer,
      [announcementWebsiteSlice.reducerPath]: announcementWebsiteSlice.reducer,
      [statusWebsiteSlice.reducerPath]: statusWebsiteSlice.reducer
    },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({ serializableCheck: false })
      .concat(announcementWebsiteSlice.middleware)
      .concat(statusWebsiteSlice.middleware)
  })
}

export type RootStore = ReturnType<typeof initializeStore>
export type RootState = ReturnType<RootStore['getState']>
