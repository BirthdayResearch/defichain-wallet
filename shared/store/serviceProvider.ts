import { createAsyncThunk, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { LocalStorageProvider } from '@api/local_storage/provider'
import { EnvironmentNetwork } from '@environment'
import { defaultDefichainURL } from '@screens/AppNavigator/screens/Settings/screens/ServiceProviderScreen'

export interface ServiceProviderURL {
  serviceProviderURL: string
}

const initialState: ServiceProviderURL = {
  serviceProviderURL: defaultDefichainURL
}

export const resetServiceProvider = createAsyncThunk(
  'serviceProvider/resetServiceProvider',
  async () => {
    return defaultDefichainURL
  }
)

export const saveCustomServiceProvider = createAsyncThunk(
  'serviceProvider/saveCustomServiceProvider',
  async (url: ServiceProviderURL) => {
    return url
  }
)

export const serviceProvider = createSlice({
  name: 'serviceProvider',
  initialState,
  reducers: {
    resetServiceProvider: (state) => {
      state.serviceProviderURL = defaultDefichainURL
    },
    saveCustomServiceProvider: (state, action: PayloadAction<string>) => {
      state.serviceProviderURL = action.payload
    }
  },
  // TODO: add extraReducers for additional action types
  // TODO: might need to check for the mainnet/playground etc. networks
})