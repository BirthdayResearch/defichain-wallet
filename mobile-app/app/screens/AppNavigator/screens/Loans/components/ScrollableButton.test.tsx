import { render } from '@testing-library/react-native'

import { ScrollableButton, ScrollButton } from './ScrollableButton'

jest.mock('@shared-contexts/ThemeProvider')
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn()
}))

describe('Scrollable button', () => {
  it('should match snapshot', async () => {
    const buttons: ScrollButton[] = [
      {
        iconName: 'add',
        iconType: 'MaterialIcons',
        label: 'ADD COLLATERAL',
        handleOnPress: () => {}
      },
      {
        iconName: 'remove',
        iconType: 'MaterialIcons',
        label: 'TAKE COLLATERAL',
        disabled: false,
        handleOnPress: () => {}
      },
      {
        iconName: 'tune',
        iconType: 'MaterialIcons',
        label: 'EDIT SCHEME',
        disabled: true,
        handleOnPress: () => {}
      }
    ]
    const rendered = render(<ScrollableButton buttons={buttons} />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
