import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { render } from '@testing-library/react-native'
import * as React from 'react'
import { NetworkDetails } from './NetworkDetails'
import { RootState } from '../../../../../store'
import { block } from '@store/block'

jest.mock('../../../../../contexts/ThemeProvider')

jest.mock('../../../../../contexts/NetworkContext', () => ({
  useNetworkContext: () => {
    return {
      network: 'Playground'
    }
  }
}))

describe('NetworkDetails', () => {
  it('<NetworkDetails /> should render components', () => {
    const initialState: Partial<RootState> = {
      block: {
        count: 2000,
        masterNodeCount: 10,
        lastSync: 'Tue Sep 14 2021 17:36:16 GMT+0530',
        connected: true,
        isPolling: true
      }
    }
    const store = configureStore({
      preloadedState: initialState,
      reducer: { block: block.reducer }
    })
    const component = (
      <Provider store={store}>
        <NetworkDetails />
      </Provider>
    )
    const rendered = render(component)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
