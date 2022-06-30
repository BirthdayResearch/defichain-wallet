import { render } from '@testing-library/react-native'
import { RecoveryWordsFaqV2 } from './RecoveryWordsFaqV2'

jest.mock('@shared-contexts/ThemeProvider')
describe('recovery words faq', () => {
  it('should match snapshot', () => {
    const rendered = render(<RecoveryWordsFaqV2 />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
