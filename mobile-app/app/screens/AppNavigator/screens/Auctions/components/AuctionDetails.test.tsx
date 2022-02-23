import {
  LoanVaultLiquidated,
  LoanVaultLiquidationBatch,
  LoanVaultState
} from '@defichain/whale-api-client/dist/api/loan'
import { configureStore } from '@reduxjs/toolkit'
import { RootState } from '@store'
import { render } from '@testing-library/react-native'
import { AuctionDetails } from './AuctionDetails'
import { Provider } from 'react-redux'
import { block } from '@store/block'
import { setTokenSymbol, wallet } from '@store/wallet'

jest.mock('@shared-contexts/ThemeProvider')
jest.mock('@shared-contexts/DeFiScanContext')
jest.mock('@shared-contexts/NetworkContext')

describe('AuctionDetails', () => {
  it('should match snapshot', async () => {
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
    const batches: LoanVaultLiquidationBatch[] = [{
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
              hash: 'af18460c64945121d96fd126bcc22dd48229ada245b0bc33129364b49168346c',
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
        },
        {
          id: '0',
          amount: '3360.60854727',
          symbol: 'DFI',
          symbolKey: 'ETH',
          name: 'Default Defi token',
          displaySymbol: 'dETH',
          activePrice: {
            id: 'DFI-USD-1386480',
            key: 'DFI-USD',
            isLive: true,
            block: {
              hash: 'af18460c64945121d96fd126bcc22dd48229ada245b0bc33129364b49168346c',
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
        }, {
          id: '0',
          amount: '3360.60854727',
          symbol: 'DFI',
          symbolKey: 'DFI',
          name: 'Default Defi token',
          displaySymbol: 'BTC',
          activePrice: {
            id: 'DFI-USD-1386480',
            key: 'DFI-USD',
            isLive: true,
            block: {
              hash: 'af18460c64945121d96fd126bcc22dd48229ada245b0bc33129364b49168346c',
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
        },
        {
          id: '0',
          amount: '3360.60854727',
          symbol: 'DFI',
          symbolKey: 'DFI',
          name: 'Default Defi token',
          displaySymbol: 'BTCs',
          activePrice: {
            id: 'DFI-USD-1386480',
            key: 'DFI-USD',
            isLive: true,
            block: {
              hash: 'af18460c64945121d96fd126bcc22dd48229ada245b0bc33129364b49168346c',
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
    ]
    const vault: LoanVaultLiquidated = {
      vaultId: '92dcef48f0109d007f6c02a263fdb9d30e618739a8d749584e0b732c5b968f54',
      loanScheme: {
        id: 'MIN200',
        minColRatio: '200',
        interestRate: '2'
      },
      ownerAddress: '8ZxMPyEeyTDcvmxgWWRDfrq8kwQEm5sbXq',
      state: LoanVaultState.IN_LIQUIDATION,
      batchCount: 2,
      liquidationHeight: 2570,
      liquidationPenalty: 5,
      batches
    }

    const initialState: Partial<RootState> = {
      wallet: {
        utxoBalance: '77',
        tokens: tokens.map(setTokenSymbol),
        allTokens: {},
        poolpairs: [],
        hasFetchedPoolpairData: false,
        hasFetchedToken: true
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
      reducer: {
        wallet: wallet.reducer,
        block: block.reducer
      }
    })

    const rendered = render(
      <Provider store={store}>
        <AuctionDetails batch={batches[0]} vault={vault} />
      </Provider>
    )
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
