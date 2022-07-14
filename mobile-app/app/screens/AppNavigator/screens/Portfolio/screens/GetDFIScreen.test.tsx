import { configureStore } from '@reduxjs/toolkit'
import { fireEvent, render } from '@testing-library/react-native'
import * as Clipboard from 'expo-clipboard'
import { Provider } from 'react-redux'
import { RootState } from '@store'
import { wallet } from '@store/wallet'
import { GetDFIScreen } from './GetDFIScreen'
import { block } from '@store/block'

jest.mock('@shared-contexts/WalletContext')
jest.mock('react-native-popover-view')

jest.mock('expo-clipboard', () => ({
  setString: jest.fn()
}))

jest.mock('@shared-contexts/WhaleContext', () => ({
  useWhaleApiClient: () => ({
    prices: {
      get: async () => ({
        id: 'DFI-USD',
        sort: '0000000300001f9dDFI-USD',
        price: {
          block: {
            hash: '2c7f5dbc1790362dd9efd3bde90d6452c39fcc8228959d5be1a6819dc5c564d5',
            height: 8093,
            medianTime: 1654240229,
            time: 1654240235
          },
          aggregated: {
            amount: '100.00000000',
            weightage: 3,
            oracles: {
              active: 3,
              total: 3
            }
          },
          currency: 'USD',
          token: 'DFI',
          id: 'DFI-USD-8093',
          key: 'DFI-USD',
          sort: '6299b3e500001f9d'
        }
      })
    }
  })
}))

jest.mock('react-native-toast-notifications', () => ({
  useToast: () => ({
    show: jest.fn(),
    hide: jest.fn(),
    hideAll: jest.fn()
  })
}))

jest.mock('@shared-contexts/ThemeProvider')
const navigation: any = {
  navigate: jest.fn()
}
const route: any = {}

describe('Get DFI page', () => {
  it('should match snapshot', async () => {
    const initialState: Partial<RootState> = {
      wallet: {
        utxoBalance: '77',
        tokens: [],
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
      }
    }
    const store = configureStore({
      preloadedState: initialState,
      reducer: { wallet: wallet.reducer, block: block.reducer }
    })
    const component = (
      <Provider store={store}>
        <GetDFIScreen navigation={navigation} route={route} />
      </Provider>
    )
    const rendered = render(component)
    expect(rendered.toJSON()).toMatchSnapshot()
  })

  it('should trigger copy', async () => {
    const initialState: Partial<RootState> = {
      wallet: {
        utxoBalance: '77',
        tokens: [],
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
      }
    }
    const store = configureStore({
      preloadedState: initialState,
      reducer: { wallet: wallet.reducer, block: block.reducer }
    })
    const component = (
      <Provider store={store}>
        <GetDFIScreen navigation={navigation} route={route} />
      </Provider>
    )
    const spy = jest.spyOn(Clipboard, 'setString')
    const rendered = render(component)
    const copyButton = await rendered.findByTestId('copy_button')
    fireEvent.press(copyButton)
    expect(spy).toHaveBeenCalled()
  })

  it('should trigger share', async () => {
    const initialState: Partial<RootState> = {
      wallet: {
        utxoBalance: '77',
        tokens: [],
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
      }
    }
    const store = configureStore({
      preloadedState: initialState,
      reducer: { wallet: wallet.reducer, block: block.reducer }
    })
    const component = (
      <Provider store={store}>
        <GetDFIScreen navigation={navigation} route={route} />
      </Provider>
    )
    const spy = jest.spyOn(Clipboard, 'setString')
    const rendered = render(component)
    const shareButton = await rendered.findByTestId('share_button')
    fireEvent.press(shareButton)
    expect(spy).toHaveBeenCalled()
  })
})
