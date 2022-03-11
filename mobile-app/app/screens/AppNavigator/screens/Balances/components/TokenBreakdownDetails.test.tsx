import { render } from '@testing-library/react-native'
import { TokenBreakdownDetails } from './TokenBreakdownDetails'
import BigNumber from 'bignumber.js'

jest.mock('@shared-contexts/ThemeProvider')
jest.mock('../../../../../contexts/DisplayBalancesContext')

describe('Token Breakdown Details', () => {
  it('should match snapshot', async () => {
    const component = (
      <TokenBreakdownDetails
        hasFetchedToken
        lockedAmount={new BigNumber('1')}
        lockedValue={new BigNumber('123')}
        availableAmount={new BigNumber('99')}
        availableValue={new BigNumber('999999.12345678')}
        testID='foo'
      />
    )
    const rendered = render(component)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
