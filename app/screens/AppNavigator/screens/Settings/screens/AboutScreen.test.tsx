import { fireEvent, render } from "@testing-library/react-native"
import * as React from 'react'
import { Linking } from 'react-native'
import { AboutScreen } from "./AboutScreen";

it('<AboutScreen /> should match snapshot', async () => {
  const tree = render(<AboutScreen />)
  expect(tree.toJSON()).toMatchSnapshot()
  const privacyPolicy = await tree.findByTestId('privacy_policy_button')
  fireEvent.press(privacyPolicy)
  expect(Linking.canOpenURL).toBeCalled()
})

