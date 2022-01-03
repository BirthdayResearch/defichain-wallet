import { render } from '@testing-library/react-native'
import { BarCodeScanner } from './BarCodeScanner'

jest.mock('@shared-contexts/ThemeProvider')

describe('barcode scanner', () => {
  it('should match snapshot', async () => {
    const navigation: any = {
      navigate: jest.fn()
    }
    const route: any = {}
    const component = (
      <BarCodeScanner
        navigation={navigation}
        route={route}
      />
    )
    const rendered = render(component)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
