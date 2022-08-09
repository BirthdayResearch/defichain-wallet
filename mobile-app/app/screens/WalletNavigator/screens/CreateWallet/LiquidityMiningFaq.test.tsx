import { render } from '@testing-library/react-native'
import { LiquidityMiningFaq } from './LiquidityMiningFaq'

jest.mock('@shared-contexts/ThemeProvider')
describe('Liquidity Mining FAQ screen', () => {
  it('should match snapshot', async () => {
    const rendered = render(<LiquidityMiningFaq />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
