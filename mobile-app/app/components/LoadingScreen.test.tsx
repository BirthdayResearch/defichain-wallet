import { render } from '@testing-library/react-native'

import LoadingScreen from './LoadingScreen'

jest.mock('@shared-contexts/ThemeProvider')
it('<LoadingScreen/> should display default text', () => {
  const { getByText } = render(<LoadingScreen />)

  expect(getByText('Loading')).toBeTruthy()
})

it('<LoadingScreen/> should display passed text', () => {
  const { getByText } = render(<LoadingScreen message='Creating Wallet' />)

  expect(getByText('Creating Wallet')).toBeTruthy()
})

it('<LoadingScreen /> should match snapshot', () => {
  const tree = render(<LoadingScreen message='Creating Wallet' />).toJSON()
  expect(tree).toMatchSnapshot()
})
