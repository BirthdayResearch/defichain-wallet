import { render } from '@testing-library/react-native'
import { DFIBalanceCard } from './DFIBalanceCard'
import { RootState } from '@store'
import { setTokenSymbol, wallet } from '@store/wallet'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { block } from '@store/block'
import { loans } from '@store/loans'
import { LoanVaultState } from '@defichain/whale-api-client/dist/api/loan'

jest.mock('@shared-contexts/ThemeProvider')
jest.mock('@shared-contexts/NetworkContext')
jest.mock('../../../../../contexts/DisplayBalancesContext')
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useIsFocused: jest.fn()
}))
jest.mock('@shared-contexts/WalletContext')

describe('DFI Balance Card', () => {
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
        vaults: [
          {
            vaultId: 'd3f52b85e004fda0244dc2f73771c7ecc91fda1a0ca1e439b421ebbb9573dae2',
            loanScheme: {
              id: 'MIN150',
              minColRatio: '150',
              interestRate: '5'
            },
            ownerAddress: 'bcrt1qsr645glm3krcskdvak5hzs5eez6u4385k9a3wv',
            state: LoanVaultState.ACTIVE,
            informativeRatio: '-1',
            collateralRatio: '-1',
            collateralValue: '212.3',
            loanValue: '0',
            interestValue: '0',
            collateralAmounts: [
              {
                id: '0',
                amount: '2.12300000',
                symbol: 'DFI',
                symbolKey: 'DFI',
                name: 'Default Defi token',
                displaySymbol: 'DFI',
                activePrice: {
                  id: 'DFI-USD-4224',
                  key: 'DFI-USD',
                  isLive: true,
                  block: {
                    hash: '01ff6c392764d0bba244369e3b6c096eac73bd5a5a1fc6a187ea7358baa56111',
                    height: 4224,
                    medianTime: 1646706425,
                    time: 1646706431
                  },
                  active: {
                    amount: '100.00000000',
                    weightage: 3,
                    oracles: {
                      active: 3,
                      total: 3
                    }
                  },
                  next: {
                    amount: '100.00000000',
                    weightage: 3,
                    oracles: {
                      active: 3,
                      total: 3
                    }
                  },
                  sort: '00001080'
                }
              }
            ],
            loanAmounts: [],
            interestAmounts: []
          }
        ],
        collateralTokens: [],
        loanPaymentTokenActivePrices: {},
        hasFetchedLoansData: false,
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
        <DFIBalanceCard />
      </Provider>
    )
    const rendered = render(component)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
