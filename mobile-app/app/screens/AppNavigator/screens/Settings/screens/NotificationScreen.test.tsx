import { AppNotificationTypesI, NotificationType } from '@api/persistence/notifiction_storage'
import { render } from '@testing-library/react-native'
import * as React from 'react'
import { NotificationScreen, RowNotificationItem } from './NotificationScreen'

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn()
}))

jest.mock('@api', () => ({
  NotificationPersistence: {
    get: async () => {
      return [{
        type: 'TRANSACTION',
        displayName: 'Transactions',
        value: true
      }]
    }
  }
}))

jest.mock('../../../../../contexts/ThemeProvider')

describe('Notification screen', () => {
  it('should render', async () => {
    const rendered = render(<NotificationScreen />)

    expect(rendered.toJSON()).toMatchSnapshot()
  })

  it('should render row notification item', async () => {
    const item: AppNotificationTypesI = {
      type: NotificationType.TRANSACTION,
      displayName: 'Transactions',
      value: true
    }
    const onChange = jest.fn
    const rendered = render(<RowNotificationItem item={item} onChange={onChange} />)

    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
