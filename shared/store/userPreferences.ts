import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { LocalStorageProvider } from '@api/local_storage/provider'
import { EnvironmentNetwork } from '@environment'

export interface LabeledAddress {
  [address: string]: string
}

export interface UserPreferences {
  addresses: LabeledAddress
}

const initialState: UserPreferences = {
  addresses: {}
}

export const fetchUserPreferences = createAsyncThunk(
  'userPreferences/fetchUserPreferences',
  async (network: EnvironmentNetwork) => {
    return await LocalStorageProvider.getUserPreferences(network)
  }
)

export const setUserPreferences = createAsyncThunk(
  'userPreferences/setUserPreferences',
  async ({
    network,
    preferences
  }: { network: EnvironmentNetwork, preferences: UserPreferences }) => {
    await LocalStorageProvider.setUserPreferences(network, preferences)
  }
)

export const setAddresses = createAsyncThunk(
  'userPreferences/setAddresses',
  async (addresses: LabeledAddress) => {
    return addresses
  }
)

export const userPreferences = createSlice({
  name: 'userPreferences',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchUserPreferences.fulfilled, (state, action: PayloadAction<UserPreferences>) => {
      state = action.payload
      return state
    })
    builder.addCase(setAddresses.fulfilled, (state, action: PayloadAction<LabeledAddress>) => {
      state.addresses = action.payload
      return state
    })
  }
})
