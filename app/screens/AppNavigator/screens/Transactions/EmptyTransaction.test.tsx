import * as React from 'react'
import { fireEvent, render } from "@testing-library/react-native"
import { EmptyTransaction } from "./EmptyTransaction"

jest.mock('@react-navigation/native');

describe('empty transaction', () => {
	it('should match snapshot', async() => {
		const navigation: any = {
      navigate: jest.fn(),
    }
		const rendered = render(<EmptyTransaction navigation={navigation}/>)
		expect(rendered.toJSON()).toMatchSnapshot();
		const receiveButton = await rendered.findByTestId('button_receive_coins')
		
		const spy = jest.spyOn(navigation, 'navigate')
		fireEvent.press(receiveButton)		
		expect(spy).toHaveBeenCalled()
	})
})