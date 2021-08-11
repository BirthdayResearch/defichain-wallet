import { render } from "@testing-library/react-native";
import * as React from "react";
import { InputIconLabel } from "./InputIconLabel"

describe('input icon label', () => {
	it('should render', () => {
		const tokenSymbol = 'DFI'
		const component = (
			<InputIconLabel label={tokenSymbol} />
		)
		const rendered = render(component)
		expect(rendered.toJSON()).toMatchSnapshot()
	})
})