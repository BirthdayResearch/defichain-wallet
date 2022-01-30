import { render } from '@testing-library/react-native'
import { RecoveryWordsScreen } from './RecoveryWordsScreen'

jest.mock('@shared-contexts/ThemeProvider')

describe('recovery word screen', () => {
  it('should match snapshot', async () => {
    const navigation: any = {
      navigate: jest.fn()
    }
    const route: any = {
      params: {
        words: ['bunker', 'layer', 'kid', 'involve', 'flight', 'figure', 'gauge', 'ticket', 'final', 'beach', 'basic', 'aspect', 'exit', 'slow', 'high', 'aerobic', 'sister', 'device', 'bullet', 'twin', 'profit', 'scale', 'sell', 'find']
      }
    }
    const rendered = render(<RecoveryWordsScreen
      navigation={navigation}
      route={route}
                            />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
