import { render } from '@testing-library/react-native'
import { DexFaqV2 } from './DexFaqV2'

jest.mock('@shared-contexts/ThemeProvider')
describe('DEX FAQ V2 screen', () => {
  it('should match snapshot', async () => {
    const rendered = render(<DexFaqV2 />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
