import { render } from '@testing-library/react-native'
import React from 'react'
import { Tabs } from './Tabs'

jest.mock('@shared-contexts/ThemeProvider')

describe('Tabs component', () => {
  it('should match snapshot with 2 tabs', async () => {
    const tabsList = [
      {
        id: 1,
        label: 'Browse loans',
        disabled: false,
        handleOnPress: jest.fn
      },
      {
        id: 2,
        label: 'Your vaults',
        disabled: true,
        handleOnPress: jest.fn
      }
    ]
    const rendered = render(<Tabs tabSections={tabsList} activeTabId={1} />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })

  it('should match snapshot with 5 tabs', async () => {
    const tabsList = [
      {
        id: 1,
        label: 'Browse loans',
        disabled: false,
        handleOnPress: jest.fn
      },
      {
        id: 2,
        label: 'Your vaults',
        disabled: false,
        handleOnPress: jest.fn
      },
      {
        id: 3,
        label: 'Collateral',
        disabled: true,
        handleOnPress: jest.fn
      },
      {
        id: 4,
        label: 'Auction',
        disabled: false,
        handleOnPress: jest.fn
      },
      {
        id: 5,
        label: 'Auction',
        disabled: false,
        handleOnPress: jest.fn
      }
    ]
    const rendered = render(<Tabs tabSections={tabsList} activeTabId={1} />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
