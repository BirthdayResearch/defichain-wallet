import { render } from '@testing-library/react-native'
import { DexActionButton } from './DexActionButton'

jest.mock('@shared-contexts/ThemeProvider')
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn()
}))

describe('Swap Button V2', () => {
  it('should match snapshot', () => {
    const pair = {
      id: '15',
      symbol: 'BTC-DFI',
      displaySymbol: 'dBTC-DFI',
      name: 'Playground BTC-Default Defi token',
      status: true,
      tokenA: {
        symbol: 'BTC',
        displaySymbol: 'dBTC',
        id: '1',
        reserve: '1000',
        blockCommission: '0'
      },
      tokenB: {
        symbol: 'DFI',
        displaySymbol: 'DFI',
        id: '0',
        reserve: '1000',
        blockCommission: '0'
      },
      priceRatio: {
        ab: '1',
        ba: '1'
      },
      commission: '0',
      totalLiquidity: {
        token: '1000',
        usd: '20000000'
      },
      tradeEnabled: true,
      ownerAddress: 'mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy',
      rewardPct: '0.1',
      rewardLoanPct: '0.1',
      creation: {
        tx: '79b5f7853f55f762c7550dd7c734dff0a473898bfb5639658875833accc6d461',
        height: 132
      }
    }

    const onPress = jest.fn()

    const rendered = render(<DexActionButton onPress={() => onPress()} label='Swap' pair={pair} />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
