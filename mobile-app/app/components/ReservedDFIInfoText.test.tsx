import { render } from '@testing-library/react-native'
import { ReservedDFIInfoText } from './ReservedDFIInfoText'

jest.mock('@shared-contexts/ThemeProvider')

describe('Reserved DFI info text', () => {
  it('should match snapshot', () => {
    const rendered = render(<ReservedDFIInfoText />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
