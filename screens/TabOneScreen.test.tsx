import * as React from 'react'
import { fireEvent, render } from 'react-native-testing-library'

import TabOneScreen from './TabOneScreen'

it('<TabOneScreen/> click should increment counter', () => {
  const { getByText } = render(<TabOneScreen />)

  expect(getByText('Count: 0')).toBeTruthy()
  fireEvent.press(getByText('Click'))
  expect(getByText('Count: 2')).toBeTruthy()
})
