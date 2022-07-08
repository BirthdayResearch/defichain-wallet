import { render } from '@testing-library/react-native'
import { RecoveryWordsScreenV2 } from './RecoveryWordsScreenV2'

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
    const rendered = render(
      <RecoveryWordsScreenV2
        navigation={navigation}
        route={route}
      />
    )
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
