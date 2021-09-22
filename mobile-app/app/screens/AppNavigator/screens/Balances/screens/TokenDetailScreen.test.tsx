import { configureStore } from '@reduxjs/toolkit'
import { fireEvent, render } from '@testing-library/react-native'
import * as React from 'react'
import { Provider } from 'react-redux'
import { RootState } from '@store'
import { wallet } from '@store/wallet'
import { TokenDetailScreen } from './TokenDetailScreen'

jest.mock('../../../../../contexts/ThemeProvider')
jest.mock('../../../../../hooks/wallet/TokensAPI', () => ({
  useTokensAPI: () => [
    {
      id: '0_utxo',
      symbol: 'DFI',
      symbolKey: 'DFI',
      displaySymbol: 'DFI (UTXO)',
      isDAT: true,
      isLPS: false,
      amount: '100000',
      name: 'DeFiChain'
    },
    {
      id: '0',
      symbol: 'DFI',
      symbolKey: 'DFI',
      displaySymbol: 'DFI (Token)',
      isDAT: true,
      isLPS: false,
      amount: '100000',
      name: 'Defi'
    }, {
      id: '1',
      symbol: 'BTC',
      symbolKey: 'BTC',
      displaySymbol: 'dBTC',
      isDAT: true,
      isLPS: false,
      amount: '100000',
      name: 'Bitcoin'
    }]
}))

describe('token detail screen', () => {
  it('should accept DST', async () => {
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
    const route: any = {
      params: {
        token: {
          id: '1',
          symbol: 'BTC',
          symbolKey: 'BTC',
          displaySymbol: 'dBTC',
          isDAT: true,
          isLPS: false,
          amount: '777',
          name: 'Bitcoin'
        }
      }
    }
    const spy = jest.spyOn(navigation, 'navigate')
    const component = (
      <Provider store={store}>
        <TokenDetailScreen
          navigation={navigation}
          route={route}
        />
      </Provider>
    )
    const rendered = render(component)
    const sendButton = await rendered.findByTestId('send_button')
    fireEvent.press(sendButton)
    expect(rendered.toJSON()).toMatchSnapshot()
    expect(spy).toHaveBeenCalled()
  })

  it('should accept UTXO DFI', async () => {
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
    const route: any = {
      params: {
        token: {
          id: '0_utxo',
          symbol: 'DFI',
          symbolKey: 'DFI',
          displaySymbol: 'DFI (UTXO)',
          isDAT: true,
          isLPS: false,
          amount: '100000',
          name: 'DeFiChain'
        }
      }
    }
    const spy = jest.spyOn(navigation, 'navigate')
    const component = (
      <Provider store={store}>
        <TokenDetailScreen
          navigation={navigation}
          route={route}
        />
      </Provider>
    )
    const rendered = render(component)
    const receiveButton = await rendered.findByTestId('receive_button')
    fireEvent.press(receiveButton)
    expect(rendered.toJSON()).toMatchSnapshot()
    expect(spy).toHaveBeenCalled()
  })

  it('should accept Token DFI', async () => {
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
    const route: any = {
      params: {
        token: {
          id: '0',
          symbol: 'DFI',
          symbolKey: 'DFI',
          displaySymbol: 'DFI (Token)',
          isDAT: true,
          isLPS: false,
          amount: '100000',
          name: 'DeFiChain'
        }
      }
    }
    const spy = jest.spyOn(navigation, 'navigate')
    const component = (
      <Provider store={store}>
        <TokenDetailScreen
          navigation={navigation}
          route={route}
        />
      </Provider>
    )
    const rendered = render(component)
    const convertButton = await rendered.findByTestId('convert_button')
    fireEvent.press(convertButton)
    expect(rendered.toJSON()).toMatchSnapshot()
    expect(spy).toHaveBeenCalled()
  })
})
