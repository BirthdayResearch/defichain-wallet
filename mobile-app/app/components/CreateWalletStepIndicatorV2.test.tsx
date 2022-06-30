import { render } from '@testing-library/react-native'
import { CreateWalletStepIndicatorV2 } from './CreateWalletStepIndicatorV2'

jest.mock('@shared-contexts/ThemeProvider')
jest.mock('@shared-contexts/NativeLoggingProvider')

describe('Create wallet step indicator', () => {
  it('should match snapshot', () => {
    const rendered = render(
      <CreateWalletStepIndicatorV2
        current={1}
        steps={['Recovery', 'Verify', 'Secure']}
      />
    )
    expect(rendered.toJSON()).toMatchSnapshot()
  })

  it('should match snapshot wne there is zero steps available', () => {
    const rendered = render(
      <CreateWalletStepIndicatorV2
        current={1}
        steps={[]}
      />
    )
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
