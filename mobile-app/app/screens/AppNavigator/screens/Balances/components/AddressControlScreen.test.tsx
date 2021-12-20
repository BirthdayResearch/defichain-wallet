import React from 'react'
import { render } from '@testing-library/react-native'
import { AddressControlCard, AddressControlModal, AddressControlScreen, AddressItemRow } from './AddressControlScreen'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { RootState } from '@store'
import { transactionQueue } from '@store/transaction_queue'
import { ocean } from '@store/ocean'

jest.mock('@shared-contexts/ThemeProvider')
jest.mock('@shared-contexts/WalletContext')
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
    setOptions: jest.fn()
  })
}))

describe('DFI address control', () => {
  it('should match snapshot for Address Control Screen', async () => {
    const rendered = render(<AddressControlScreen />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })

  it('should match snapshot for Address Control Modal', async () => {
    const onClose = jest.fn()
    const rendered = render(<AddressControlModal onClose={onClose} />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })

  it('should match snapshot for Address Control Card', async () => {
    const onClose = jest.fn()
    const rendered = render(<AddressControlCard onClose={onClose} />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })

  it('should match snapshot for Address Item Row', async () => {
    const onPress = jest.fn()
    const initialState: Partial<RootState> = {
      transactionQueue: {
        transactions: []
      },
      ocean: {
        transactions: [],
        height: 0,
        err: undefined
      }
    }
    const store = configureStore({
      preloadedState: initialState,
      reducer: {
        transactionQueue: transactionQueue.reducer,
        ocean: ocean.reducer
      }
    })
    const rendered = render(
      <Provider store={store}>
        <AddressItemRow
          address='bcrt1q8rfsfny80jx78cmk4rsa069e2ckp6rn83u6ut9'
          isActive
          index={0}
          onPress={onPress}
        />
      </Provider>
    )
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
