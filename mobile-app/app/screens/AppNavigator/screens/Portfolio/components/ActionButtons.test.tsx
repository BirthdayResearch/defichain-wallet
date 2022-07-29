import { render } from '@testing-library/react-native'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { RootState } from '@store'
import { futureSwaps } from '@store/futureSwap'
import { ActionButtons } from './ActionButtons'

jest.mock('@shared-contexts/ThemeProvider')
jest.mock('@contexts/FeatureFlagContext')
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn()
}))

describe('DFI Action Buttons', () => {
  it('should match snapshot for Action Buttons component', async () => {
    const initialState: Partial<RootState> = {
      futureSwaps: {
        futureSwaps: [],
        executionBlock: 0
      }
    }
    const store = configureStore({
      preloadedState: initialState,
      reducer: { futureSwaps: futureSwaps.reducer }
    })

    const rendered = render(
      <Provider store={store}>
        <ActionButtons />
      </Provider>
    )
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
