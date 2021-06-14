import * as React from 'react'
import { render } from 'react-native-testing-library'
import { HelpScreen } from "./HelpScreen";

it('<HelpScreen /> should match snapshot', () => {
  const tree = render(<HelpScreen />).toJSON()
  expect(tree).toMatchSnapshot()
})

