/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { configureStore } from "@reduxjs/toolkit";
import { userPreferences } from "@store/userPreferences";
import {
  transactionQueue,
  block,
  ocean,
  wallet,
  announcementWebsiteSlice,
  statusWebsiteSlice,
} from "@waveshq/walletkit-ui/dist/store";
import { authentication } from "./authentication";
import { loans } from "./loans";
import { auctions } from "./auctions";
import { futureSwaps } from "./futureSwap";
/**
 * RootState for DeFiChain Wallet App
 *
 * All state reducer in this store must be designed for global use and placed in this
 * directory as such. Reducer that are not meant to be global must not be part of
 * RootState.
 *
 * Non-global state should be managed independently within its own React Component.
 */
export function initializeStore() {
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
      [statusWebsiteSlice.reducerPath]: statusWebsiteSlice.reducer,
      userPreferences: userPreferences.reducer,
      futureSwaps: futureSwaps.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false })
        .concat(announcementWebsiteSlice.middleware)
        .concat(statusWebsiteSlice.middleware),
  });
}

export type RootStore = ReturnType<typeof initializeStore>;
export type RootState = ReturnType<RootStore["getState"]>;
