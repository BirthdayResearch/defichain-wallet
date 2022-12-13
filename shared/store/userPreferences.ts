import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { LocalStorageProvider } from "@api/local_storage/provider";
import { EnvironmentNetwork } from "@waveshq/wallet-core";

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

const initialState: UserPreferences = {
  addresses: {},
  addressBook: {},
};

export const fetchUserPreferences = createAsyncThunk(
  "userPreferences/fetchUserPreferences",
  async (network: EnvironmentNetwork) => {
    return await LocalStorageProvider.getUserPreferences(network);
  }
);

export const setUserPreferences = createAsyncThunk(
  "userPreferences/setUserPreferences",
  async ({
    network,
    preferences,
  }: {
    network: EnvironmentNetwork;
    preferences: UserPreferences;
  }) => {
    await LocalStorageProvider.setUserPreferences(network, preferences);
  }
);

export const setAddresses = createAsyncThunk(
  "userPreferences/setAddresses",
  async (addresses: LabeledAddress) => {
    return addresses;
  }
);

export const setAddressBook = createAsyncThunk(
  "userPreferences/setAddressBook",
  async (addressBook: LabeledAddress) => {
    return addressBook;
  }
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
      }
    );
    builder.addCase(
      setAddresses.fulfilled,
      (state, action: PayloadAction<LabeledAddress>) => {
        state.addresses = action.payload;
        return state;
      }
    );
    builder.addCase(
      setAddressBook.fulfilled,
      (state, action: PayloadAction<LabeledAddress>) => {
        state.addressBook = action.payload;
        return state;
      }
    );
  },
});

export const selectAddressBookArray = createSelector(
  (state: UserPreferences) => state.addressBook,
  (addressBook) => {
    return prepopulateField(addressBook);
  }
);

export const selectLocalWalletAddressArray = createSelector(
  (state: UserPreferences) => state.addresses,
  (walletAddress) => {
    return prepopulateField(walletAddress);
  }
);

const prepopulateField = (addresses: LabeledAddress): LocalAddress[] => {
  const _addresses: LabeledAddress = { ...addresses };

  // pre-populate address and isFavourite flag for older app version, used for UI data model only
  for (const address in addresses) {
    if (addresses[address].address === undefined) {
      const _address = {
        ...addresses[address],
        address: address,
        isFavourite: false,
      };
      _addresses[address] = _address;
    }
  }
  return Object.values(_addresses);
};
