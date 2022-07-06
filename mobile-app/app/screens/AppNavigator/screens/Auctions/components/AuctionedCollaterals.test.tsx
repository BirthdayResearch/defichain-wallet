import { configureStore } from '@reduxjs/toolkit'
import { RootState } from '@store'
import { block } from '@store/block'
import { setTokenSymbol, wallet } from '@store/wallet'
import { render } from '@testing-library/react-native'
import { Provider } from 'react-redux'
import { AuctionedCollaterals } from './AuctionedCollaterals'

jest.mock('@shared-contexts/ThemeProvider')

describe('Auctioned collaterals', () => {
  it('should match snapshot', async () => {
    const collaterals = [{
      id: '0',
      amount: '10',
      symbol: 'DFI',
      symbolKey: 'DFI',
      name: 'Default Defi token',
      displaySymbol: 'DFI',
      activePrice: {
        id: 'DFI-USD-408',
        key: 'DFI-USD',
        isLive: true,
        block: {
          hash: 'TestBlockHash',
          height: 408,
          medianTime: 1641314521,
          time: 1641314527
        },
        active: {
          amount: '100',
          weightage: 3,
          oracles: {
            active: 3,
            total: 3
          }
        },
        next: {
          amount: '100',
          weightage: 3,
          oracles: {
            active: 3,
            total: 3
          }
        },
        sort: '00000198'
      }
    }]
    const auctionAmount = '100'
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
      }
    }
    const store = configureStore({
      preloadedState: initialState,
      reducer: {
        wallet: wallet.reducer,
        block: block.reducer
      }
    })
    const rendered = render(
      <Provider store={store}>
        <AuctionedCollaterals collaterals={collaterals} auctionAmount={auctionAmount} />
      </Provider>
    )
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
