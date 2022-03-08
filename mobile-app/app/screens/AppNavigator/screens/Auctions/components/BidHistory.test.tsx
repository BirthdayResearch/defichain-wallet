import { RootState } from '@store'
import { block } from '@store/block'
import { render } from '@testing-library/react-native'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { BidHistory } from './BidHistory'
import { auctions } from '@store/auctions'
import { LoanVaultState } from '@defichain/whale-api-client/dist/api/loan'
import { setTokenSymbol, wallet } from '@store/wallet'

jest.mock('@shared-contexts/ThemeProvider')
jest.mock('@shared-contexts/NetworkContext')
jest.mock('@screens/AppNavigator/screens/Auctions/hooks/BidTimeAgo', () => ({
  useBidTimeAgo: (_bidTime: number) => ('1m 2h ago')
}))
jest.mock('@react-navigation/native', () => ({
  useIsFocused: jest.fn()
}))

describe('Bid History', () => {
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
      },
      block: {
        count: 2000,
        masternodeCount: 10,
        lastSuccessfulSync: 'Tue, 14 Sep 2021 15:37:10 GMT',
        connected: true,
        isPolling: true
      },
      auctions: {
        auctions: [{
          vaultId: '4775da5083f9284fb9023f0f0c517f4e6c40f4921699cc9014aece651c2e099d',
          loanScheme: {
            id: 'MIN150',
            minColRatio: '150',
            interestRate: '5'
          },
          ownerAddress: 'bcrt1qy50yx2ajur5kyw3cgz5djsuwep4k2dwkqd2vdv',
          state: LoanVaultState.IN_LIQUIDATION,
          batchCount: 1,
          liquidationHeight: 5251,
          liquidationPenalty: 5,
          batches: [
            {
              index: 0,
              collaterals: [
                {
                  id: '0',
                  amount: '0.01662762',
                  symbol: 'DFI',
                  symbolKey: 'DFI',
                  name: 'Default Defi token',
                  displaySymbol: 'DFI',
                  activePrice: {
                    id: 'DFI-USD-5244',
                    key: 'DFI-USD',
                    isLive: true,
                    block: {
                      hash: 'b61fc7ab5316a26b77ccbbbd8ee00171a758325b77680212dfaa736af66f078a',
                      height: 5244,
                      medianTime: 1646197827,
                      time: 1646197833
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
                    sort: '0000147c'
                  }
                }
              ],
              loan: {
                id: '11',
                amount: '0.08643132',
                symbol: 'TU10',
                symbolKey: 'TU10',
                name: 'Decentralized TU10',
                displaySymbol: 'dTU10',
                activePrice: {
                  id: 'TU10-USD-5244',
                  key: 'TU10-USD',
                  isLive: true,
                  block: {
                    hash: 'b61fc7ab5316a26b77ccbbbd8ee00171a758325b77680212dfaa736af66f078a',
                    height: 5244,
                    medianTime: 1646197827,
                    time: 1646197833
                  },
                  active: {
                    amount: '12.91047488',
                    weightage: 3,
                    oracles: {
                      active: 3,
                      total: 3
                    }
                  },
                  next: {
                    amount: '12.91477886',
                    weightage: 3,
                    oracles: {
                      active: 3,
                      total: 3
                    }
                  },
                  sort: '0000147c'
                }
              },
              froms: [
                'bcrt1qy50yx2ajur5kyw3cgz5djsuwep4k2dwkqd2vdv',
                'bcrt1qy50yx2ajur5kyw3cgz5djsuwep4k2dwkqd2vdv',
                'bcrt1qy50yx2ajur5kyw3cgz5djsuwep4k2dwkqd2vdv',
                'bcrt1qy50yx2ajur5kyw3cgz5djsuwep4k2dwkqd2vdv',
                'bcrt1qy50yx2ajur5kyw3cgz5djsuwep4k2dwkqd2vdv',
                'bcrt1qy50yx2ajur5kyw3cgz5djsuwep4k2dwkqd2vdv'
              ],
              highestBid: {
                owner: 'bcrt1qy50yx2ajur5kyw3cgz5djsuwep4k2dwkqd2vdv',
                amount: {
                  id: '11',
                  amount: '0.09538220',
                  symbol: 'TU10',
                  symbolKey: 'TU10',
                  name: 'Decentralized TU10',
                  displaySymbol: 'dTU10',
                  activePrice: {
                    id: 'TU10-USD-5244',
                    key: 'TU10-USD',
                    isLive: true,
                    block: {
                      hash: 'b61fc7ab5316a26b77ccbbbd8ee00171a758325b77680212dfaa736af66f078a',
                      height: 5244,
                      medianTime: 1646197827,
                      time: 1646197833
                    },
                    active: {
                      amount: '12.91047488',
                      weightage: 3,
                      oracles: {
                        active: 3,
                        total: 3
                      }
                    },
                    next: {
                      amount: '12.91477886',
                      weightage: 3,
                      oracles: {
                        active: 3,
                        total: 3
                      }
                    },
                    sort: '0000147c'
                  }
                }
              }
            }
          ]
        }],
        hasFetchAuctionsData: true,
        bidHistory: [
          {
            id: '4775da5083f9284fb9023f0f0c517f4e6c40f4921699cc9014aece651c2e099d-0-3fe6b021c2bf6d2c3493809beb66df903394c7de7b98608984b9110ff6113cd0',
            key: '4775da5083f9284fb9023f0f0c517f4e6c40f4921699cc9014aece651c2e099d-0',
            sort: '0000147a-3fe6b021c2bf6d2c3493809beb66df903394c7de7b98608984b9110ff6113cd0',
            vaultId: '4775da5083f9284fb9023f0f0c517f4e6c40f4921699cc9014aece651c2e099d',
            index: 0,
            from: '0014251e432bb2e0e9623a3840a8d9438ec86b6535d6',
            amount: '0.0953822',
            tokenId: 11,
            block: {
              hash: 'b7ed01e81606286db564110406a617e2424513d33e11432ff228793b6862d46e',
              height: 5242,
              medianTime: 1646197821,
              time: 1646197827
            }
          },
          {
            id: '4775da5083f9284fb9023f0f0c517f4e6c40f4921699cc9014aece651c2e099d-0-686fb56975111c2e0db63166b5fc01993b80a38df23c48ebcf24f5fe8decb88c',
            key: '4775da5083f9284fb9023f0f0c517f4e6c40f4921699cc9014aece651c2e099d-0',
            sort: '00001477-686fb56975111c2e0db63166b5fc01993b80a38df23c48ebcf24f5fe8decb88c',
            vaultId: '4775da5083f9284fb9023f0f0c517f4e6c40f4921699cc9014aece651c2e099d',
            index: 0,
            from: '0014251e432bb2e0e9623a3840a8d9438ec86b6535d6',
            amount: '0.09443782',
            tokenId: 11,
            block: {
              hash: 'eaf5dd866a64f994158fa08d47f66d926c6bf1e9254f0e64e763782fe6c93d13',
              height: 5239,
              medianTime: 1646197813,
              time: 1646197820
            }
          },
          {
            id: '4775da5083f9284fb9023f0f0c517f4e6c40f4921699cc9014aece651c2e099d-0-077dec5808d9c3678eb42e28eab7e880c39d96e05cafbb533efc63d28575570a',
            key: '4775da5083f9284fb9023f0f0c517f4e6c40f4921699cc9014aece651c2e099d-0',
            sort: '00001474-077dec5808d9c3678eb42e28eab7e880c39d96e05cafbb533efc63d28575570a',
            vaultId: '4775da5083f9284fb9023f0f0c517f4e6c40f4921699cc9014aece651c2e099d',
            index: 0,
            from: '0014251e432bb2e0e9623a3840a8d9438ec86b6535d6',
            amount: '0.09350279',
            tokenId: 11,
            block: {
              hash: '10d8cfbed727a70d6555c149f3b944b5cc919a334763f8d18a881671ea24a8af',
              height: 5236,
              medianTime: 1646197804,
              time: 1646197811
            }
          },
          {
            id: '4775da5083f9284fb9023f0f0c517f4e6c40f4921699cc9014aece651c2e099d-0-97d840110984b98c1b3823620d35829afd1f72f09033987b1f4e530e026e0a5a',
            key: '4775da5083f9284fb9023f0f0c517f4e6c40f4921699cc9014aece651c2e099d-0',
            sort: '00001471-97d840110984b98c1b3823620d35829afd1f72f09033987b1f4e530e026e0a5a',
            vaultId: '4775da5083f9284fb9023f0f0c517f4e6c40f4921699cc9014aece651c2e099d',
            index: 0,
            from: '0014251e432bb2e0e9623a3840a8d9438ec86b6535d6',
            amount: '0.09257702',
            tokenId: 11,
            block: {
              hash: '72dfcd5af04eb1fcac214ec341b9c2ba6e9a50a40757fc40bd5b63ac7f48b3b4',
              height: 5233,
              medianTime: 1646197795,
              time: 1646197801
            }
          },
          {
            id: '4775da5083f9284fb9023f0f0c517f4e6c40f4921699cc9014aece651c2e099d-0-837fa6505305174cc3b53567d717941a2c0b4da46159c502814e218fc6f94797',
            key: '4775da5083f9284fb9023f0f0c517f4e6c40f4921699cc9014aece651c2e099d-0',
            sort: '0000146e-837fa6505305174cc3b53567d717941a2c0b4da46159c502814e218fc6f94797',
            vaultId: '4775da5083f9284fb9023f0f0c517f4e6c40f4921699cc9014aece651c2e099d',
            index: 0,
            from: '0014251e432bb2e0e9623a3840a8d9438ec86b6535d6',
            amount: '0.09166042',
            tokenId: 11,
            block: {
              hash: '78b180be3fff75d8e1d3d3e3574660e5e3709cee2cd7599e4add2bb53c84e8d6',
              height: 5230,
              medianTime: 1646197788,
              time: 1646197791
            }
          },
          {
            id: '4775da5083f9284fb9023f0f0c517f4e6c40f4921699cc9014aece651c2e099d-0-b0646df8ca8ca2e42fae3890ebf2ec7aa0f4e1eb2881353ba042b53988655b8f',
            key: '4775da5083f9284fb9023f0f0c517f4e6c40f4921699cc9014aece651c2e099d-0',
            sort: '00001469-b0646df8ca8ca2e42fae3890ebf2ec7aa0f4e1eb2881353ba042b53988655b8f',
            vaultId: '4775da5083f9284fb9023f0f0c517f4e6c40f4921699cc9014aece651c2e099d',
            index: 0,
            from: '0014251e432bb2e0e9623a3840a8d9438ec86b6535d6',
            amount: '0.09075289',
            tokenId: 11,
            block: {
              hash: '0a90af5513094a05c35b8b77cc09e09e3f1dacf8108b4d4909de889d22a799ec',
              height: 5225,
              medianTime: 1646197771,
              time: 1646197777
            }
          }
        ]
      }
    }

    const store = configureStore({
      preloadedState: initialState,
      reducer: {
        wallet: wallet.reducer,
        block: block.reducer,
        auctions: auctions.reducer
      }
    })

    const rendered = render(
      <Provider store={store}>
        <BidHistory
          vaultId='4775da5083f9284fb9023f0f0c517f4e6c40f4921699cc9014aece651c2e099d'
          liquidationHeight={5251}
          batchIndex={0}
          loanDisplaySymbol='dTU10'
          loanSymbol='TU10'
          minNextBidInToken='0.09633602'
        />
      </Provider>
    )
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
