import { render } from '@testing-library/react-native'
import { AuctionsFaqV2 } from './AuctionsFaqV2'

jest.mock('@shared-contexts/ThemeProvider')

describe('Auctions FAQ V2 screen', () => {
  it('should match snapshot', async () => {
    const rendered = render(<AuctionsFaqV2 />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
