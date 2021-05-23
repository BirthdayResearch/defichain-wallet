import * as React from 'react'
import { fireEvent, render } from 'react-native-testing-library'

import BalancesScreen from './BalancesScreen'

it('<BalancesScreen/> click should increment counter', () => {
  const { getByText } = render(<BalancesScreen />)

  expect(getByText('Count: 0')).toBeTruthy()
  fireEvent.press(getByText('Click'))
  expect(getByText('Count: 2')).toBeTruthy()
})
