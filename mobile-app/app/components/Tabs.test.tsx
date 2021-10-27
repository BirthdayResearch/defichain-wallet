import { render } from '@testing-library/react-native'
import React from 'react'
import { Tabs } from './Tabs'

jest.mock('../contexts/ThemeProvider')

describe('Tabs component', () => {
  it('should match snapshot with 2 tabs', async () => {
    const tabsList = [
      {
        label: 'Browse loans',
        isActive: true,
        disabled: false,
        handleOnPress: jest.fn
      },
      {
        label: 'Your vaults',
        isActive: false,
        disabled: true,
        handleOnPress: jest.fn
      }
    ]
    const rendered = render(<Tabs tabSections={tabsList} />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })

  it('should match snapshot with 5 tabs', async () => {
    const tabsList = [
      {
        label: 'Browse loans',
        isActive: true,
        disabled: false,
        handleOnPress: jest.fn
      },
      {
        label: 'Your vaults',
        isActive: false,
        disabled: false,
        handleOnPress: jest.fn
      },
      {
        label: 'Collateral',
        isActive: false,
        disabled: true,
        handleOnPress: jest.fn
      },
      {
        label: 'Auction',
        isActive: false,
        disabled: false,
        handleOnPress: jest.fn
      },
      {
        label: 'Auction',
        isActive: false,
        disabled: false,
        handleOnPress: jest.fn
      }
    ]
    const rendered = render(<Tabs tabSections={tabsList} />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
