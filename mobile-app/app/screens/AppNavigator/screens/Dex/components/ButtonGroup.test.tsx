import { render } from '@testing-library/react-native'
import { ButtonGroup } from './ButtonGroup'

jest.mock('@shared-contexts/ThemeProvider')

describe('ButtonGroup component', () => {
  it('should match snapshot with 2 buttons', async () => {
    const buttonGroup = [{
      id: 'ALL_PAIRS',
      label: 'All pairs',
      handleOnPress: jest.fn
    }, {
      id: 'DFI_PAIRS',
      label: 'DFI pairs',
      handleOnPress: jest.fn
    }, {
      id: 'DUSD_PAIRS',
      label: 'DUSD pairs',
      handleOnPress: jest.fn
    }]

    const rendered = render(<ButtonGroup buttons={buttonGroup} activeButtonGroupItem='ALL_PAIRS' testID='foo' />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
