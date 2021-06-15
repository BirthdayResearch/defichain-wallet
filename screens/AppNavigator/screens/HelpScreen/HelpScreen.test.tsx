import * as React from 'react'
import { render } from "@testing-library/react-native"
import { HelpScreen } from "./HelpScreen";

it('<HelpScreen /> should match snapshot', () => {
  const tree = render(<HelpScreen />).toJSON()
  expect(tree).toMatchSnapshot()
})

