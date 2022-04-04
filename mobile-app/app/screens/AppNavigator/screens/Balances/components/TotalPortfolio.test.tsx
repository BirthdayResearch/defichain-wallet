import { render } from '@testing-library/react-native'
import { RootState } from '@store'
import { setTokenSymbol, wallet } from '@store/wallet'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { block } from '@store/block'
import { TotalPortfolio } from './TotalPortfolio'
import BigNumber from 'bignumber.js'
import { loans } from '@store/loans'

jest.mock('@shared-contexts/ThemeProvider')
jest.mock('@contexts/DisplayBalancesContext')

describe('DFI Total Portfolio Card', () => {
  it('should match snapshot', async () => {
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
        swappableTokens: {},
        hasFetchedPoolpairData: false,
        hasFetchedToken: true,
        hasFetchedSwappableTokens: false
      },
      loans: {
        vaults: [],
        collateralTokens: [],
        loanPaymentTokenActivePrices: {},
        hasFetchedLoansData: true,
        hasFetchedVaultsData: true,
        hasFetchedLoanSchemes: true,
        loanSchemes: [],
        loanTokens: []
      }
    }
    const store = configureStore({
      preloadedState: initialState,
      reducer: {
        wallet: wallet.reducer,
        block: block.reducer,
        loans: loans.reducer
      }
    })
    const component = (
      <Provider store={store}>
        <TotalPortfolio
          totalLoansUSDValue={new BigNumber(100)}
          totalAvailableUSDValue={new BigNumber(1000)}
          totalLockedUSDValue={new BigNumber(300)}
          onToggleDisplayBalances={jest.fn()}
          isBalancesDisplayed
        />
      </Provider>
    )
    const rendered = render(component)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
