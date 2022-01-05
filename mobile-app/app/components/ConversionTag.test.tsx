import { render } from '@testing-library/react-native'
import { ConversionTag } from './ConversionTag'

jest.mock('@shared-contexts/ThemeProvider')

describe('Conversion tag', () => {
  it('should match snapshot', async () => {
    const rendered = render(<ConversionTag />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
