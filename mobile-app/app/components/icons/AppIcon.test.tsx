import { render } from '@testing-library/react-native'
import { AppIcon } from './AppIcon'

it('<AppIcon /> should match snapshot', () => {
  const tree = render(<AppIcon />).toJSON()
  expect(tree).toMatchSnapshot()
})
