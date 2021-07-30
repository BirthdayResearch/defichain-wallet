import { fireEvent, render } from "@testing-library/react-native";
import * as React from "react";
import { TokensVsUtxoScreen } from "./TokensVsUtxoScreen";

describe('tokens vs utxo screen', () => {
	it('should render', async() => {
		const component = (
			<TokensVsUtxoScreen />
		)
		const rendered = render(component)
		expect(rendered.toJSON()).toMatchSnapshot()
	})
})