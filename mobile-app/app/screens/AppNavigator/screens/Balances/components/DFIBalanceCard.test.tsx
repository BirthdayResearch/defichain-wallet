import { render } from '@testing-library/react-native'
import { DFIBalanceCard } from './DFIBalanceCard'
import { RootState } from '@store'
import { setTokenSymbol, wallet } from '@store/wallet'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { block } from '@store/block'

jest.mock('@shared-contexts/ThemeProvider')
jest.mock('@shared-contexts/NetworkContext')
jest.mock('../../../../../contexts/DisplayBalancesContext')
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn()
}))

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
        hasFetchedPoolpairData: false,
        hasFetchedToken: true
      }
    }
    const store = configureStore({
      preloadedState: initialState,
      reducer: {
        wallet: wallet.reducer,
        block: block.reducer
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
