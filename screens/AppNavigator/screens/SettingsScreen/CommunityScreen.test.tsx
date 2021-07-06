import { fireEvent, render } from "@testing-library/react-native"
import * as React from 'react'
import { CommunityScreen } from "./CommunityScreen";
import { Linking } from 'react-native'

it('<CommunityScreen /> should match snapshot', async () => {
  const tree = render(<CommunityScreen />)
  expect(tree.toJSON()).toMatchSnapshot()
  const receiveButton = await tree.findByTestId('gh')
  fireEvent.press(receiveButton)
  expect(Linking.canOpenURL).toBeCalled()
})

