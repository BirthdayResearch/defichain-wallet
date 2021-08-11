import { fireEvent, render } from "@testing-library/react-native"
import * as React from 'react'
import { EmptyTransaction } from "./EmptyTransaction"

jest.mock('@react-navigation/native');

describe('empty transaction', () => {
  it('should match snapshot', async () => {
    const navigation: any = {
      navigate: jest.fn(),
    }
    const rendered = render(<EmptyTransaction navigation={navigation} handleRefresh={() => {
    }} key={'1'} loadingStatus={'loading'} />)
    expect(rendered.toJSON()).toMatchSnapshot();
    const receiveButton = await rendered.findByTestId('button_receive_coins')

    const spy = jest.spyOn(navigation, 'navigate')
    fireEvent.press(receiveButton)
    expect(spy).toHaveBeenCalled()
  })
})
