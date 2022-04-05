import { configureStore } from '@reduxjs/toolkit'
import { RootState } from '@store'
import { userPreferences } from '@store/userPreferences'
import { render } from '@testing-library/react-native'
import { Provider } from 'react-redux'
import { AddressListEditButton } from './AddressListEditButton'

jest.mock('@shared-contexts/ThemeProvider')

describe('Address List Edit Button', () => {
  it('should match snapshot', async () => {
    const initialState: Partial<RootState> = {
      userPreferences: {
        addresses: {
          foo: {
            label: 'foo',
            isMine: true
          }
        },
        addressBook: {
          bar: {
            label: 'bar',
            isMine: false
          }
        }
      }
    }
    const store = configureStore({
      preloadedState: initialState,
      reducer: { userPreferences: userPreferences.reducer }
    })

    const rendered = render(
      <Provider store={store}>
        <AddressListEditButton isEditing handleOnPress={jest.fn} />
      </Provider>
    )

    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
