import { render } from "@testing-library/react-native";
import * as Localization from 'expo-localization';
import * as React from "react";
import { NumberTextInput } from "./NumberTextInput"

jest.mock('expo-localization')

describe('NumberTextInput', () => {
  it(`should match snapshot with period decimal locale`, () => {
    (Localization as any).decimalSeparator = '.'
    const component = (
      <NumberTextInput value={123} editable={true} placeholder='Enter an amount' />
    )
    const rendered = render(component)
    expect(rendered.toJSON()).toMatchSnapshot()
  })

  it(`should match snapshot with period comma locale`, () => {
    (Localization as any).decimalSeparator = ','
    const component = (
      <NumberTextInput value={123} editable={true} placeholder='Enter an amount' />
    )
    const rendered = render(component)
    expect(rendered.toJSON()).toMatchSnapshot()
  })

  it(`should match snapshot with period unknown locale`, () => {
    (Localization as any).decimalSeparator = ' '
    const component = (
      <NumberTextInput value={123} editable={true} placeholder='Enter an amount' />
    )
    const rendered = render(component)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
