import { render } from '@testing-library/react-native'
import { CreateWalletGuidelines } from './CreateWalletGuidelinesV2'

jest.mock('@shared-contexts/ThemeProvider')
describe('create wallet guidelines v2', () => {
  it('should match snapshot', () => {
    const navigation: any = {
      navigate: jest.fn()
    }
    const route: any = {}
    const rendered = render(
      <CreateWalletGuidelines
        navigation={navigation}
        route={route}
      />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
