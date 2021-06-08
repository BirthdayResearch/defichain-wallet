import * as React from 'react'
import { render } from 'react-native-testing-library'

import LoadingScreen from './LoadingScreen'

it('<LoadingScreen/> should display default text', () => {
  const { getByText } = render(<LoadingScreen />)

  expect(getByText('Loading')).toBeTruthy()
})

it('<LoadingScreen/> should display passed text', () => {
  const { getByText } = render(<LoadingScreen message={'Creating Wallet'} />)

  expect(getByText('Creating Wallet')).toBeTruthy()
})

