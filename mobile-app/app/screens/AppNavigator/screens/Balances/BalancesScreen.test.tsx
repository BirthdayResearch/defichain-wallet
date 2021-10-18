import { configureStore } from '@reduxjs/toolkit'
import { fireEvent, render } from '@testing-library/react-native'
import * as React from 'react'
import { Provider } from 'react-redux'
import { RootState } from '@store'
import { wallet } from '@store/wallet'
import { BalancesScreen } from './BalancesScreen'

jest.mock('@react-navigation/bottom-tabs', () => ({
  useBottomTabBarHeight: () => 49
}))
jest.mock('randomcolor', () => jest.fn().mockReturnValue('#ffffff'))
jest.mock('../../../../contexts/ThemeProvider')
jest.mock('../../../../contexts/LanguageProvider')

jest.mock('../../../../hooks/wallet/TokensAPI', () => ({
  useTokensAPI: () => [{
    id: '0',
    symbol: 'DFI',
    symbolKey: 'DFI',
    isDAT: true,
    isLPS: false,
    amount: '23',
    name: 'Defi'
  }, {
    id: '1',
    symbol: 'BTC',
    symbolKey: 'BTC',
    isDAT: true,
    isLPS: false,
    amount: '777',
    name: 'Bitcoin'
  },
  {
    id: '2',
    symbol: 'ETH',
    symbolKey: 'ETH',
    isDAT: true,
    isLPS: false,
    amount: '555',
    name: 'Ethereum'
  }]
}))

jest.mock('../../../../contexts/WalletContext', () => ({
  useWalletContext: () => {
    return {
      address: 'bcrt1q6np0fh47ykhznjhrtfvduh73cgjg32yac8t07d'
    }
  }
}))

jest.mock('../../../../contexts/WalletPersistenceContext', () => ({
  useWalletPersistenceContext: () => {
    return {
      wallets: []
    }
  }
}))

jest.mock('../../../../contexts/DisplayBalancesContext', () => ({
  useDisplayBalancesContext: () => {
    return {
      isBalancesDisplayed: true
    }
  }
}))

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn()
}))

describe('balances page', () => {
  it('should match snapshot', async () => {
    const initialState: Partial<RootState> = {
      wallet: {
        utxoBalance: '77',
        tokens: [],
        poolpairs: []
      }
    }
    const store = configureStore({
      preloadedState: initialState,
      reducer: { wallet: wallet.reducer }
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
        tokens: [],
        poolpairs: []
      }
    }
    const store = configureStore({
      preloadedState: initialState,
      reducer: { wallet: wallet.reducer }
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
