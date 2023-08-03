import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { LocalStorageProvider } from "@api/local_storage/provider";
import { EnvironmentNetwork } from "@waveshq/walletkit-core";
import { DomainType } from "@contexts/DomainContext";

export interface LabeledAddress {
  [address: string]: LocalAddress | WhitelistedAddress;
}

export interface WhitelistedAddress {
  address: string;
  label: string;
  addressDomainType: DomainType;
  isFavourite?: boolean;
}

export interface LocalAddress {
  address: string;
  evmAddress: string;
  label: string;
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
    const { addresses, addressBook } =
      await LocalStorageProvider.getUserPreferences(network);
    return { addresses, addressBook: prePopulateWhitelistedField(addressBook) };
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
  (addressBook): WhitelistedAddress[] => {
    return prePopulateField(addressBook) as WhitelistedAddress[];
  }
);

export const selectLocalWalletAddressArray = createSelector(
  (state: UserPreferences) => state.addresses,
  (walletAddress): LocalAddress[] => {
    return prePopulateField(walletAddress) as LocalAddress[];
  }
);

// to get wallet label for saved all (DFI and EVM) wallet address, adding all relevant address type in object
export const selectAllLabeledWalletAddress = createSelector(
  (state: UserPreferences) => state.addresses,
  (walletAddress): LabeledAddress => {
    return (Object.values(walletAddress) as LocalAddress[]).reduce(
      (allAddress, each) => {
        return {
          ...allAddress,
          [each.address]: each,
          [each.evmAddress]: each,
        };
      },
      {}
    );
  }
);

const prePopulateField = (
  addresses: LabeledAddress
): (LocalAddress | WhitelistedAddress)[] => {
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

const prePopulateWhitelistedField = (
  addressBook: LabeledAddress
): LabeledAddress => {
  const address = Object.values(addressBook);
  return (address as WhitelistedAddress[]).reduce(
    (all: LabeledAddress, each: WhitelistedAddress) => {
      return {
        ...all,
        [each.address]: {
          address: each.address,
          label: each.label,
          addressDomainType: each.addressDomainType ?? DomainType.DVM,
          isFavourite: each.isFavourite,
        },
      };
    },
    {}
  );
};
