/* eslint-disable */

import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { EnvironmentNetwork } from "@waveshq/walletkit-core";

export interface LabeledAddress {
  [address: string]: LocalAddress;
}

export interface LocalAddress {
  address: string;
  label: string;
  isMine: boolean;
  isFavourite?: boolean;
}

export interface UserPreferences {
  addresses: LabeledAddress;
  addressBook: LabeledAddress;
}

const prepopulateField = (addresses: LabeledAddress): LocalAddress[] => {
  const _addresses: LabeledAddress = { ...addresses };

  // pre-populate address and isFavourite flag for older app version, used for UI data model only
  for (const address in addresses) {
    if (addresses[address].address === undefined) {
      const _address = {
        ...addresses[address],
        address,
        isFavourite: false,
      };
      _addresses[address] = _address;
    }
  }
  return Object.values(_addresses);
};

const initialState: UserPreferences = {
  addresses: {},
  addressBook: {},
};

export const fetchUserPreferences = createAsyncThunk(
  "userPreferences/fetchUserPreferences",
  // TODO @julio replace with type
  async (network: EnvironmentNetwork, localStorage: any) =>
    await localStorage.getUserPreferences(network),
);

export const setUserPreferences = createAsyncThunk(
  "userPreferences/setUserPreferences",
  async ({
    network,
    preferences,
    localStorage,
  }: {
    network: EnvironmentNetwork;
    preferences: UserPreferences;
    // TODO @julio replace with type
    localStorage: any;
  }) => {
    await localStorage.setUserPreferences(network, preferences);
  },
);

export const setAddresses = createAsyncThunk(
  "userPreferences/setAddresses",
  async (addresses: LabeledAddress) => addresses,
);

export const setAddressBook = createAsyncThunk(
  "userPreferences/setAddressBook",
  async (addressBook: LabeledAddress) => addressBook,
);

export const userPreferences = createSlice({
  name: "userPreferences",
  initialState,
  reducers: {
    addToAddressBook: (state, action: PayloadAction<LabeledAddress>) => {
      state.addressBook = {
        ...state.addressBook,
        ...action.payload,
      };
    },
    deleteFromAddressBook: (state, action: PayloadAction<string>) => {
      const { [action.payload]: _, ...newAddressBook } = state.addressBook;
      state.addressBook = newAddressBook;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchUserPreferences.fulfilled,
      (state, action: PayloadAction<UserPreferences>) => {
        state = action.payload;
        return state;
      },
    );
    builder.addCase(
      setAddresses.fulfilled,
      (state, action: PayloadAction<LabeledAddress>) => {
        state.addresses = action.payload;
        return state;
      },
    );
    builder.addCase(
      setAddressBook.fulfilled,
      (state, action: PayloadAction<LabeledAddress>) => {
        state.addressBook = action.payload;
        return state;
      },
    );
  },
});

export const selectAddressBookArray = createSelector(
  (state: UserPreferences) => state.addressBook,
  (addressBook) => prepopulateField(addressBook),
);

export const selectLocalWalletAddressArray = createSelector(
  (state: UserPreferences) => state.addresses,
  (walletAddress) => prepopulateField(walletAddress),
);
