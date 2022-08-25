import { render } from '@testing-library/react-native'
import { LiquidityMiningFaqV2 } from './LiquidityMiningFaqV2'

jest.mock('@shared-contexts/ThemeProvider')
describe('Liquidity Mining V2 FAQ screen', () => {
  it('should match snapshot', async () => {
    const rendered = render(<LiquidityMiningFaqV2 />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
