import { render } from '@testing-library/react-native'
import { AuctionedCollaterals } from './AuctionedCollaterals'

jest.mock('@shared-contexts/ThemeProvider')

describe('Auctioned collaterals', () => {
  it('should match snapshot', async () => {
    const collaterals = [{
      id: '0',
      amount: '10',
      symbol: 'DFI',
      symbolKey: 'DFI',
      name: 'Default Defi token',
      displaySymbol: 'DFI',
      activePrice: {
        id: 'DFI-USD-408',
        key: 'DFI-USD',
        isLive: true,
        block: {
          hash: 'TestBlockHash',
          height: 408,
          medianTime: 1641314521,
          time: 1641314527
        },
        active: {
          amount: '100',
          weightage: 3,
          oracles: {
            active: 3,
            total: 3
          }
        },
        next: {
          amount: '100',
          weightage: 3,
          oracles: {
            active: 3,
            total: 3
          }
        },
        sort: '00000198'
      }
    }]
    const auctionAmount = '100'
    const rendered = render(<AuctionedCollaterals collaterals={collaterals} auctionAmount={auctionAmount} />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
