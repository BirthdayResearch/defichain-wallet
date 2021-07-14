import { configureStore } from "@reduxjs/toolkit";
import { act, fireEvent, render } from "@testing-library/react-native";
import * as React from "react";
import { Provider } from "react-redux";
import { RootState } from "../../../../../store";
import { wallet } from "../../../../../store/wallet";
import { PoolSwapScreen } from "./PoolSwapScreen";

jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper')

jest.mock("../../../../../hooks/wallet/TokensAPI", () => ({
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
}));

jest.mock('../../../../../contexts/WalletContext', () => ({
  useWallet: () => ({
    get: (_) => ({})
  })
}))

jest.mock('../../../../../contexts/WhaleContext', () => ({
  useWhaleApiClient: () => ({})
}))

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({}),
  DefaultTheme: { colors: {} }
}))

describe('poolswap page', () => {
  it('should be able to input values', async () => {
    const initialState: Partial<RootState> = {
      wallet: {
        address: 'bcrt1q6np0fh47ykhznjhrtfvduh73cgjg32yac8t07d',
        utxoBalance: '77',
        tokens: []
      }
    };
    const store = configureStore({
      preloadedState: initialState,
      reducer: { wallet: wallet.reducer }
    })
    const navigation: any = {
      navigate: jest.fn(),
    }
    const route: any = {
      params: {
        poolpair: {
          symbol: 'A-B',
          tokenA: {
            id: '0',
            reserve: '100'
          },
          tokenB: {
            id: '1',
            reserve: '10'
          }
        }
      }
    }
    const component = (
      <Provider store={store}>
        <PoolSwapScreen navigation={navigation} route={route} />
      </Provider>
    );
    const { getByTestId, toJSON } = render(component)
    await act(async () => {
      fireEvent.changeText(getByTestId('text_input_tokenA'), '1')
      fireEvent.changeText(getByTestId('text_input_tokenB'), '0.9')
    })
    expect(toJSON()).toMatchSnapshot()
  })
})
