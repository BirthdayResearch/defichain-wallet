import { render } from '@testing-library/react-native'

import { LoansFaq } from './LoansFaq'

jest.mock('@shared-contexts/ThemeProvider')
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn()
}))

describe('LoansFaq FAQ screen', () => {
  it('should match snapshot', async () => {
    const navigation: any = {
      navigate: jest.fn()
    }
    const route: any = {
      params: {
        activeSessions: [0]
      }
    }
    const rendered = render(<LoansFaq navigation={navigation} route={route} />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
