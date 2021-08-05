import { render } from "@testing-library/react-native";
import BigNumber from "bignumber.js";
import * as React from "react";
import { SetAmountButton } from "./SetAmountButton";

const buttonType: Array<'half' | 'max'> = ['half', 'max']
const buttonAmount = new BigNumber(10);

describe('set amount button', () => {
  buttonType.forEach(type => {
    it(`should match styling of set amount button type ${type}`, () => {
      const onPress = jest.fn()
      const component = (
        <SetAmountButton type={type} amount={buttonAmount} onPress={onPress} />
      )
      const rendered = render(component)
      expect(rendered.toJSON()).toMatchSnapshot()
    })
  })
})
