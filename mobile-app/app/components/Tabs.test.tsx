import { render } from '@testing-library/react-native'

import { Tabs } from './Tabs'

jest.mock('@shared-contexts/ThemeProvider')

describe('Tabs component', () => {
  it('should match snapshot with 2 tabs', async () => {
    const tabsList = [
      {
        id: 0,
        label: 'Browse loan tokens',
        disabled: false,
        handleOnPress: jest.fn
      },
      {
        id: 1,
        label: 'Your vaults',
        disabled: true,
        handleOnPress: jest.fn
      }
    ]
    const rendered = render(<Tabs tabSections={tabsList} activeTabKey={0} testID='loans_tabs' />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })

  it('should match snapshot with 5 tabs', async () => {
    const tabsList = [
      {
        id: 0,
        label: 'Browse loan tokens',
        disabled: false,
        handleOnPress: jest.fn
      },
      {
        id: 1,
        label: 'Your vaults',
        disabled: false,
        handleOnPress: jest.fn
      },
      {
        id: 2,
        label: 'Collateral',
        disabled: true,
        handleOnPress: jest.fn
      },
      {
        id: 3,
        label: 'Auction',
        disabled: false,
        handleOnPress: jest.fn
      },
      {
        id: 4,
        label: 'Auction',
        disabled: false,
        handleOnPress: jest.fn
      }
    ]
    const rendered = render(<Tabs tabSections={tabsList} activeTabKey={0} testID='loans_tabs' />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
