import { fireEvent, render } from '@testing-library/react-native'
import { EmptyTransaction } from './EmptyTransaction'

jest.mock('@react-navigation/native')
jest.mock('@shared-contexts/ThemeProvider')

describe('empty transaction', () => {
  it('should match snapshot', async () => {
    const navigation: any = {
      navigate: jest.fn()
    }
    const rendered = render(<EmptyTransaction
      handleRefresh={() => {
      }}
      key='1'
      loadingStatus='loading'
      navigation={navigation}
                            />)
    expect(rendered.toJSON()).toMatchSnapshot()
    const receiveButton = await rendered.findByTestId('button_receive_coins')

    const spy = jest.spyOn(navigation, 'navigate')
    fireEvent.press(receiveButton)
    expect(spy).toHaveBeenCalled()
  })
})
