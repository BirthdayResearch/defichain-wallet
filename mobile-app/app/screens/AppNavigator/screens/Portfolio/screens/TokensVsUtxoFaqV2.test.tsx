import { render } from '@testing-library/react-native'
import { TokensVsUtxoFaqV2 } from './TokensVsUtxoFaqV2'

jest.mock('@shared-contexts/ThemeProvider')

describe('Tokens vs Utxo FAQ V2 screen', () => {
  it('should match snapshot', async () => {
    const rendered = render(<TokensVsUtxoFaqV2 />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
