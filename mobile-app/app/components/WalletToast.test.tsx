import { render } from '@testing-library/react-native'
import { WalletToast } from './WalletToast'

jest.mock('@shared-contexts/ThemeProvider')

describe('wallet toast', () => {
  it('should render and match snapshot', async () => {
    const rendered = render(
      <WalletToast
        toast={{
          id: 'foo',
          onDestroy: jest.fn,
          message: 'foo',
          open: true,
          onHide: jest.fn
        }}
      />
    )
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
