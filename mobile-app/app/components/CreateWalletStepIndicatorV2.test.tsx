import { render } from '@testing-library/react-native'
import { CreateWalletStepIndicatorV2 } from './CreateWalletStepIndicatorV2'

jest.mock('@shared-contexts/ThemeProvider')

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
})
