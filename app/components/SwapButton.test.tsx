import * as React from 'react'
import { render } from '@testing-library/react-native'
import { SwapButton } from './SwapButton'

describe('swap button', () => {
	it('should match snapshot', async() => {
		const onPress = jest.fn()
		const rendered = render(<SwapButton onPress={onPress}/>)
		expect(rendered.toJSON()).toMatchSnapshot()
	})
})