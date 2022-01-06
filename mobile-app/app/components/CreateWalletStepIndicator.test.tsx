import { render } from '@testing-library/react-native'
import { CreateWalletStepIndicator } from './CreateWalletStepIndicator'

jest.mock('@shared-contexts/ThemeProvider')

describe('Create wallet step indicator', () => {
  it('should match snapshot', () => {
    const rendered = render(
      <CreateWalletStepIndicator
        current={1}
        steps={['Recovery', 'Verify', 'Secure']}
      />
    )
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
