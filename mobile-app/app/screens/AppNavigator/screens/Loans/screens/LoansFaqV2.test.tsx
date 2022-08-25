import { render } from '@testing-library/react-native'
import { LoansFaqV2 } from './LoansFaqV2'

jest.mock('@shared-contexts/ThemeProvider')
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn()
}))

describe('LoansFaq FAQ V2 screen', () => {
  it('should match snapshot', async () => {
    const navigation: any = {
      navigate: jest.fn()
    }
    const route: any = {
      params: {
        activeSessions: [0]
      }
    }
    const rendered = render(<LoansFaqV2 navigation={navigation} route={route} />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
