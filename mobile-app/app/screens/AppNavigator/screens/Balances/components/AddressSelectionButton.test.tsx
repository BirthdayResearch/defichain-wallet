import { render } from '@testing-library/react-native'
import { AddressSelectionButton } from './AddressSelectionButton'

jest.mock('@shared-contexts/ThemeProvider')

describe('Address Selection Button', () => {
  it('should match snapshot', async () => {
    const onPress = jest.fn()
    const component = (
      <AddressSelectionButton address='foo' onPress={onPress} />
    )
    const rendered = render(component)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
