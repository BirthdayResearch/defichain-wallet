import { render } from "@testing-library/react-native"
import * as React from 'react'
import { CommunityScreen } from "./CommunityScreen";

it('<CommunityScreen /> should match snapshot', () => {
  const tree = render(<CommunityScreen />).toJSON()
  expect(tree).toMatchSnapshot()
})

