import { configureStore } from '@reduxjs/toolkit'
import { fireEvent, render } from '@testing-library/react-native'
import * as React from 'react'
import { Provider } from 'react-redux'
import { RootState } from '@store'
import { wallet, setTokenDetails } from '@store/wallet'
import { block } from '@store/block'
import { BalancesScreen } from './BalancesScreen'

jest.mock('@react-navigation/bottom-tabs', () => ({
  useBottomTabBarHeight: () => 49
}))
jest.mock('randomcolor', () => jest.fn().mockReturnValue('#ffffff'))
jest.mock('@shared-contexts/ThemeProvider')
jest.mock('@shared-contexts/LanguageProvider')
jest.mock('@shared-contexts/DeFiScanContext')
jest.mock('@shared-contexts/WalletContext')
jest.mock('@shared-contexts/WalletPersistenceContext')

jest.mock('@contexts/DisplayBalancesContext')

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn()
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
    amount: '23',
    name: 'Defi'
  }, {
    id: '1',
    symbol: 'BTC',
    symbolKey: 'BTC',
    displaySymbol: 'dBTC',
    isDAT: true,
    isLPS: false,
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
    amount: '555',
    name: 'Ethereum'
  }]

  it('should match snapshot', async () => {
    const initialState: Partial<RootState> = {
      wallet: {
        utxoBalance: '77',
        tokens: tokens.map(setTokenDetails),
        poolpairs: []
      },
      block: {
        count: 100,
        masternodeCount: 10,
        lastSync: undefined,
        connected: true,
        isPolling: true,
        tvl: undefined
      }
    }
    const store = configureStore({
      preloadedState: initialState,
      reducer: { wallet: wallet.reducer, block: block.reducer }
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
        tokens: tokens.map(setTokenDetails),
        poolpairs: []
      },
      block: {
        count: 100,
        masternodeCount: 10,
        lastSync: undefined,
        connected: true,
        isPolling: true,
        tvl: undefined
      }
    }
    const store = configureStore({
      preloadedState: initialState,
      reducer: { wallet: wallet.reducer, block: block.reducer }
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
