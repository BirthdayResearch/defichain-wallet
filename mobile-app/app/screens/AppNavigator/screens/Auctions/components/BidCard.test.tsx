import { RootState } from '@store'
import { block } from '@store/block'
import { render } from '@testing-library/react-native'

import { BidCard } from './BidCard'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

jest.mock('@shared-contexts/ThemeProvider')
jest.mock('@shared-contexts/NetworkContext')

describe('Bid Card', () => {
  it('should match snapshot', async () => {
    const initialState: Partial<RootState> = {
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
      reducer: { block: block.reducer }
    })

    const vaultId = '92dcef48f0109d007f6csdsjhd2637618739a8d749584e0b732c5b968f54'
    const batch = {
      index: 0,
      collaterals: [
        {
          id: '0',
          amount: '3360.60854727',
          symbol: 'DFI',
          symbolKey: 'DFI',
          name: 'Default Defi token',
          displaySymbol: 'DFI',
          activePrice: {
            id: 'DFI-USD-1386480',
            key: 'DFI-USD',
            isLive: true,
            block: {
              hash: 'af18460c64945121d96fd126bcc22dsfsfs229ada245b0bc33129364b49168346c',
              height: 1386480,
              medianTime: 1637562729,
              time: 1637562731
            },
            active: {
              amount: '2.97565149',
              weightage: 30,
              oracles: {
                active: 3,
                total: 3
              }
            },
            next: {
              amount: '2.98680778',
              weightage: 30,
              oracles: {
                active: 3,
                total: 3
              }
            },
            sort: '001527f0'
          }
        }
      ],
      froms: [
        '0014b5561e1cefa71f30efb6951c3d6d12ebd0baba02',
        '001477e853f11c5881465978b731e8bdfd4abc079bc8',
        '001480a0db34bbcc146d81458662b9d5432b5a4aaefc'
      ],
      loan: {
        id: '15',
        amount: '5015.07942533',
        symbol: 'DUSD',
        symbolKey: 'DUSD',
        name: 'Decentralized USD',
        displaySymbol: 'DUSD'
      }
    }
    const rendered = render(
      <Provider store={store}>
        <BidCard vaultId={vaultId} batch={batch} liquidationHeight={9870} />
      </Provider>
    )
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
