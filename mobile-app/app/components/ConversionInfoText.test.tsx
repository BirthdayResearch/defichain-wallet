import { render } from '@testing-library/react-native'
import { ConversionInfoText } from './ConversionInfoText'

jest.mock('@shared-contexts/ThemeProvider')

describe('Conversion info text', () => {
  it('should match snapshot', async () => {
    const rendered = render(<ConversionInfoText />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
