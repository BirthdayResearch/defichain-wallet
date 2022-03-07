import { configureStore } from '@reduxjs/toolkit'
import { fireEvent, render } from '@testing-library/react-native'
import { Provider } from 'react-redux'
import { RootState } from '@store'
import { wallet, setTokenSymbol } from '@store/wallet'
import { block } from '@store/block'
import { BalancesScreen } from './BalancesScreen'
import { LoanVaultState } from '@defichain/whale-api-client/dist/api/loan'
import { loans } from '@store/loans'

jest.mock('@react-navigation/bottom-tabs', () => ({
  useBottomTabBarHeight: () => 49
}))
jest.mock('randomcolor', () => jest.fn().mockReturnValue('#ffffff'))
jest.mock('@shared-contexts/ThemeProvider')
jest.mock('@shared-contexts/LanguageProvider')
jest.mock('@shared-contexts/DeFiScanContext')
jest.mock('@shared-contexts/WalletContext')
jest.mock('@shared-contexts/WalletPersistenceContext')
jest.mock('@shared-contexts/NetworkContext')
jest.mock('@contexts/DisplayBalancesContext')

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useIsFocused: jest.fn()
}))
jest.mock('@gorhom/bottom-sheet', () => ({
  useBottomSheetModal: () => ({
    dismiss: jest.fn()
  })
}))

jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'web',
  select: () => jest.fn
}))

describe('balances page', () => {
  const tokens = [{
    id: '0',
    symbol: 'DFI',
    symbolKey: 'DFI',
    displaySymbol: 'DFI',
    isDAT: true,
    isLPS: false,
    isLoanToken: false,
    amount: '23',
    name: 'Defi'
  }, {
    id: '1',
    symbol: 'BTC',
    symbolKey: 'BTC',
    displaySymbol: 'dBTC',
    isDAT: true,
    isLPS: false,
    isLoanToken: false,
    amount: '777',
    name: 'Bitcoin'
  },
  {
    id: '2',
    symbol: 'ETH',
    symbolKey: 'ETH',
    displaySymbol: 'dETH',
    isDAT: true,
    isLPS: false,
    isLoanToken: false,
    amount: '555',
    name: 'Ethereum'
  }]

  it('should match snapshot', async () => {
    const initialState: Partial<RootState> = {
      wallet: {
        utxoBalance: '77',
        tokens: tokens.map(setTokenSymbol),
        allTokens: {},
        poolpairs: [],
        hasFetchedPoolpairData: false,
        hasFetchedToken: true
      },
      loans: {
        vaults: [{
          vaultId: '22ffasd5ca123123123123123121231061',
          loanAmounts: [],
          collateralRatio: '',
          collateralValue: '',
          collateralAmounts: [],
          loanScheme: {
            id: '0',
            interestRate: '3',
            minColRatio: '100'
          },
          loanValue: '100',
          ownerAddress: 'bcrt1qxzj8pnkeqznvx6xgeepdywus8lkxq3vvmeccyt',
          state: LoanVaultState.ACTIVE,
          informativeRatio: '0',
          interestAmounts: [],
          interestValue: '1'
        }],
        collateralTokens: [],
        hasFetchedLoansData: false,
        hasFetchedVaultsData: false,
        loanSchemes: [],
        loanTokens: []
      },
      block: {
        count: 100,
        masternodeCount: 10,
        lastSuccessfulSync: undefined,
        connected: true,
        isPolling: true,
        tvl: undefined
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
    const navigation: any = {
      navigate: jest.fn()
    }
    const route: any = {}
    const component = (
      <Provider store={store}>
        <BalancesScreen
          navigation={navigation}
          route={route}
        />
      </Provider>
    )
    const rendered = render(component)
    expect(rendered.toJSON()).toMatchSnapshot()
  })

  it('should navigate to token detail page', async () => {
    const initialState: Partial<RootState> = {
      wallet: {
        utxoBalance: '77',
        tokens: tokens.map(setTokenSymbol),
        allTokens: {},
        poolpairs: [],
        hasFetchedPoolpairData: false,
        hasFetchedToken: true
      },
      loans: {
        vaults: [{
          vaultId: '22ffasd5ca123123123123123121231061',
          loanAmounts: [],
          collateralRatio: '',
          collateralValue: '',
          collateralAmounts: [],
          loanScheme: {
            id: '0',
            interestRate: '3',
            minColRatio: '100'
          },
          loanValue: '100',
          ownerAddress: 'bcrt1qxzj8pnkeqznvx6xgeepdywus8lkxq3vvmeccyt',
          state: LoanVaultState.ACTIVE,
          informativeRatio: '0',
          interestAmounts: [],
          interestValue: '1'
        }],
        collateralTokens: [],
        hasFetchedLoansData: false,
        hasFetchedVaultsData: false,
        loanSchemes: [],
        loanTokens: []
      },
      block: {
        count: 100,
        masternodeCount: 10,
        lastSuccessfulSync: undefined,
        connected: true,
        isPolling: true,
        tvl: undefined
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
    const navigation: any = {
      navigate: jest.fn()
    }
    const route: any = {}
    const spy = jest.spyOn(navigation, 'navigate')
    const component = (
      <Provider store={store}>
        <BalancesScreen
          navigation={navigation}
          route={route}
        />
      </Provider>
    )
    const rendered = render(component)
    const btcBalanceRow = await rendered.findByTestId('balances_row_1')
    fireEvent.press(btcBalanceRow)
    expect(spy).toHaveBeenCalled()
  })
})
