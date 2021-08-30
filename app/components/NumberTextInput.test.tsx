import { render } from "@testing-library/react-native";
import * as Localization from 'expo-localization';
import * as React from "react";
import { Platform } from 'react-native'
import { NumberTextInput } from "./NumberTextInput"

jest.mock("../contexts/ThemeProvider")
jest.mock('expo-localization')

const platform = ['ios', 'android']

describe('NumberTextInput', () => {
  platform.forEach((os) => {

    it(`should match snapshot with OS ${os} period decimal locale`, () => {
      (Platform as any).OS = os;
      (Localization as any).decimalSeparator = '.'
      const component = (
        <NumberTextInput value={'123'} editable={true} placeholder='Enter an amount' />
      )
      const rendered = render(component)
      expect(rendered.toJSON()).toMatchSnapshot()
    })

    it(`should match snapshot with OS ${os} period comma locale`, () => {
      (Platform as any).OS = os;
      (Localization as any).decimalSeparator = ','
      const component = (
        <NumberTextInput value={'123'} editable={true} placeholder='Enter an amount' />
      )
      const rendered = render(component)
      expect(rendered.toJSON()).toMatchSnapshot()
    })

    it(`should match snapshot with OS ${os} period unknown locale`, () => {
      (Platform as any).OS = os;
      (Localization as any).decimalSeparator = ' '
      const component = (
        <NumberTextInput value={'123'} editable={true} placeholder='Enter an amount' />
      )
      const rendered = render(component)
      expect(rendered.toJSON()).toMatchSnapshot()
    })
  })

})
