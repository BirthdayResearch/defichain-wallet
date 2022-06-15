import { renderHook } from '@testing-library/react-hooks'
import { useSwappableTokens } from './SwappableTokens'
import { WhaleProvider } from '@shared-contexts/WhaleContext'
import { ReactNode } from 'react'
import { NetworkProvider } from '@shared-contexts/NetworkContext'
import { SecuredStoreAPI } from '@api'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { setTokenSymbol, wallet } from '@store/wallet'
import { block } from '@store/block'
import { auctions } from '@store/auctions'
import { RootState } from '@store'

jest.mock('@react-navigation/core', () => {
  const { useFocusEffect } = jest.requireActual('@react-navigation/native')
  return {
    ...jest.requireActual('@react-navigation/core'),
    useFocusEffect: jest.fn().mockImplementation(useFocusEffect)
  }
})

describe('useSwappableTokens hook', () => {
  const initialState: Partial<RootState> = {
    wallet: {
      utxoBalance: '77',
      tokens: [{
        id: '0',
        symbol: 'DFI',
        symbolKey: 'DFI',
        displaySymbol: 'DFI',
        isDAT: true,
        isLPS: false,
        isLoanToken: false,
        amount: '23',
        name: 'DeFiChain'
      }].map(setTokenSymbol),
      allTokens: {},
      poolpairs: [],
      dexPrices: {},
      swappableTokens: {},
      hasFetchedPoolpairData: false,
      hasFetchedToken: true,
      hasFetchedSwappableTokens: false
    },
    block: {
      count: 2000,
      masternodeCount: 10,
      lastSuccessfulSync: 'Tue, 14 Sep 2021 15:37:10 GMT',
      connected: true,
      isPolling: true
    },
    auctions: {
      auctions: [],
      hasFetchAuctionsData: true,
      bidHistory: []
    }
  }

  const store = configureStore({
    preloadedState: initialState,
    reducer: {
      wallet: wallet.reducer,
      block: block.reducer,
      auctions: auctions.reducer
    }
  })
  const wrapper = ({ children }: {children: ReactNode}): JSX.Element => (
    <Provider store={store}>
      <NetworkProvider api={SecuredStoreAPI}>
        <WhaleProvider>
          {children}
        </WhaleProvider>
      </NetworkProvider>
    </Provider>
  )

  it('should get fromTokens', async () => {
    const { waitForNextUpdate } = renderHook(() => useSwappableTokens(undefined), { wrapper })
    await waitForNextUpdate()
  })
})
