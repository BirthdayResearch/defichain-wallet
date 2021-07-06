import { fireEvent, render } from "@testing-library/react-native";
import * as React from "react";
import { Text } from "react-native";
import { PrimaryButton } from "./PrimaryButton";

describe('primary button', () => {
  it('should match snapshot', async () => {
    const onPress = jest.fn()
    const component = (
      <PrimaryButton onPress={onPress} title={'Submit'} children={<Text>Hello World</Text>} testID={'primary_button'} />
    );
    const rendered = render(component)
    const receiveButton = await rendered.findByTestId('primary_button')
    fireEvent.press(receiveButton)
    expect(rendered.toJSON()).toMatchSnapshot()
    expect(onPress).toBeCalled()
  })

  it('should match snapshot with disabled button', async () => {
    const onPress = jest.fn()
    const component = (
      <PrimaryButton disabled={true} onPress={onPress} title={'Submit'} children={<Text>Hello World</Text>}
                     testID={'primary_button'} />
    );
    const rendered = render(component)
    const receiveButton = await rendered.findByTestId('primary_button')
    fireEvent.press(receiveButton)
    expect(rendered.toJSON()).toMatchSnapshot()
    expect(onPress).toBeCalledTimes(0)
  })
})
