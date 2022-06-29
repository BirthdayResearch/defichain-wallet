import { render } from '@testing-library/react-native'
import { WalletCreateRestoreSuccess } from './WalletCreateRestoreSuccess'

jest.mock('@shared-contexts/ThemeProvider')
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 100 })
}))
describe('WalletCreateRestoreSuccess', () => {
  it('should match create wallet snapshot', () => {
    const navigation: any = {
      navigate: jest.fn()
    }
    const route: any = {
      params: {
        isWalletRestored: false
      }
    }
    const rendered = render(
      <WalletCreateRestoreSuccess
        navigation={navigation}
        route={route}
      />
    )
    expect(rendered.toJSON()).toMatchSnapshot()
  })

  it('should match restore wallet snapshot', () => {
    const navigation: any = {
      navigate: jest.fn()
    }
    const route: any = {
      params: {
        isWalletRestored: true
      }
    }
    const rendered = render(
      <WalletCreateRestoreSuccess
        navigation={navigation}
        route={route}
      />
    )
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
