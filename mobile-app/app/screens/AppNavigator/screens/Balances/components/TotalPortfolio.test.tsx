import { render } from '@testing-library/react-native'
import { RootState } from '@store'
import { setTokenSymbol, wallet } from '@store/wallet'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { block } from '@store/block'
import { PortfolioButtonGroupTabKey, TotalPortfolio } from './TotalPortfolio'
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
        dexPrices: {},
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
          totalLoansValue={new BigNumber(100)}
          totalAvailableValue={new BigNumber(1000)}
          totalLockedValue={new BigNumber(300)}
          onToggleDisplayBalances={jest.fn()}
          isBalancesDisplayed
          portfolioButtonGroupOptions={{
            activePortfolioButtonGroup: PortfolioButtonGroupTabKey.USDT,
            setActivePortfolioButtonGroup: jest.fn()
          }}
          portfolioButtonGroup={[{
            id: PortfolioButtonGroupTabKey.USDT,
            label: 'USD',
            handleOnPress: jest.fn()
          }
          ]}
        />
      </Provider>
    )
    const rendered = render(component)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
