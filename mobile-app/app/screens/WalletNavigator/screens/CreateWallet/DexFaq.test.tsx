import { render } from '@testing-library/react-native'
import { DexFaq } from './DexFaq'

jest.mock('@shared-contexts/ThemeProvider')
describe('DEX FAQ screen', () => {
  it('should match snapshot', async () => {
    const rendered = render(<DexFaq />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
