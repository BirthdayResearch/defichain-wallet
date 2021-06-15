import * as React from 'react'
import { getTokenIcon } from "./_index";
import { render } from "@testing-library/react-native";

it('getTokenIcon("DFI") should get <IconDFI /> snapshot', () => {
  const Icon = getTokenIcon('DFI')
  const tree = render(<Icon />).toJSON()
  expect(tree).toMatchSnapshot()
})

it('getTokenIcon("FAKE") should get <IconDefault /> snapshot', () => {
  const Icon = getTokenIcon('FAKE')
  expect(Icon).toMatchSnapshot()
})
