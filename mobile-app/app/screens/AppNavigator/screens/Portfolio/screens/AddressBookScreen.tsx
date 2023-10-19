import { View } from "@components";
import {
  ThemedIcon,
  ThemedSectionTitleV2,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2,
} from "@components/themed";
import {
  StackNavigationOptions,
  StackScreenProps,
} from "@react-navigation/stack";
import { RootState } from "@store";
import {
  LocalAddress,
  selectAddressBookArray,
  selectLocalWalletAddressArray,
  setUserPreferences,
  userPreferences,
  WhitelistedAddress,
} from "@store/userPreferences";
import { getColor, tailwind } from "@tailwind";
import { translate } from "@translations";
import { createRef, useCallback, useEffect, useState, useMemo } from "react";
import {
  Platform,
  ScrollView,
  StyleProp,
  TextInput,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { Image } from "expo-image";
import { useSelector } from "react-redux";
import { useNetworkContext, useThemeContext } from "@waveshq/walletkit-ui";
import { useDeFiScanContext } from "@shared-contexts/DeFiScanContext";
import { debounce } from "lodash";
import { openURL } from "@api/linking";
import { Logging } from "@api";
import { useWalletContext } from "@shared-contexts/WalletContext";
import { useWalletAddress, WalletAddressI } from "@hooks/useWalletAddress";
import { useAppDispatch } from "@hooks/useAppDispatch";
import LightEmptyAddress from "@assets/images/empty-address-light.png";
import DarkEmptyAddress from "@assets/images/empty-address-dark.png";
import { ButtonV2 } from "@components/ButtonV2";
import { useNavigatorScreenOptions } from "@hooks/useNavigatorScreenOptions";
import { SearchInput } from "@components/SearchInput";
import { RefreshIcon } from "@screens/WalletNavigator/assets/RefreshIcon";
import { DomainType, useDomainContext } from "@contexts/DomainContext";
import { RandomAvatar } from "@screens/AppNavigator/screens/Portfolio/components/RandomAvatar";
import { EvmTag } from "@components/EvmTag";
import { ButtonGroup } from "../../Dex/components/ButtonGroup";
import {
  FavoriteCheckIcon,
  FavoriteUnCheckIcon,
} from "../../Settings/assets/FavoriteIcon";
import { SettingsParamList } from "../../Settings/SettingsNavigator";

type Props = StackScreenProps<SettingsParamList, "AddressBookScreen">;

export enum ButtonGroupTabKey {
  Whitelisted = "WHITELISTED",
  YourAddress = "YOUR_ADDRESS",
}

export function AddressBookScreen({ route, navigation }: Props): JSX.Element {
  const { selectedAddress, onAddressSelect, disabledTab, addressDomainType } =
    route.params;
  const { isLight } = useThemeContext();
  const { network } = useNetworkContext();
  const { isEvmFeatureEnabled } = useDomainContext();
  const dispatch = useAppDispatch();
  // condition to hide icon if not from send page
  const isAddressSelectDisabled =
    selectedAddress !== undefined && onAddressSelect !== undefined;
  const userPreferencesFromStore = useSelector(
    (state: RootState) => state.userPreferences,
  );
  const whitelistedAddresses: WhitelistedAddress[] = useSelector(
    (state: RootState) => selectAddressBookArray(state.userPreferences),
  );

  const addressBook = useMemo(() => {
    return whitelistedAddresses?.filter((addr) => {
      return (
        isEvmFeatureEnabled ||
        (!isEvmFeatureEnabled && addr.addressDomainType === DomainType.DVM)
      );
    });
  }, [whitelistedAddresses]);

  const walletAddressFromStore: LocalAddress[] = useSelector(
    (state: RootState) => selectLocalWalletAddressArray(state.userPreferences),
  ); // not all wallet address are stored in userPreference
  const [walletAddress, setWalletAddress] = useState<LocalAddress[]>(
    walletAddressFromStore,
  ); // combine labeled wallet address with jellyfish's api wallet
  const [isSearchFocus, setIsSearchFocus] = useState(false);
  const { headerStyle }: StackNavigationOptions = useNavigatorScreenOptions();
  const { getAddressUrl } = useDeFiScanContext();
  const { wallet, addressLength } = useWalletContext();
  const searchRef = createRef<TextInput>();
  const { fetchWalletAddresses } = useWalletAddress();
  const [filteredAddressBook, setFilteredAddressBook] =
    useState<WhitelistedAddress[]>(addressBook);
  const [filteredWalletAddress, setFilteredWalletAddress] =
    useState<LocalAddress[]>(walletAddress);

  const buttonGroup = [
    {
      id: ButtonGroupTabKey.Whitelisted,
      label: translate("screens/AddressBookScreen", "Whitelisted"),
      handleOnPress: () => setActiveButtonGroup(ButtonGroupTabKey.Whitelisted),
      isDisabled: disabledTab === ButtonGroupTabKey.Whitelisted,
    },
    {
      id: ButtonGroupTabKey.YourAddress,
      label: translate("screens/AddressBookScreen", "Your address"),
      handleOnPress: () => setActiveButtonGroup(ButtonGroupTabKey.YourAddress),
      isDisabled: disabledTab === ButtonGroupTabKey.YourAddress,
    },
  ];
  const [activeButtonGroup, setActiveButtonGroup] = useState<ButtonGroupTabKey>(
    disabledTab === ButtonGroupTabKey.Whitelisted
      ? ButtonGroupTabKey.YourAddress
      : ButtonGroupTabKey.Whitelisted,
  );

  useEffect(() => {
    // combine redux store and jellyfish wallet
    let isSubscribed = true;
    fetchWalletAddresses().then((walletAddresses) => {
      if (isSubscribed) {
        const addresses: LocalAddress[] = [];
        walletAddresses.forEach((address: WalletAddressI) => {
          const storedWalletAddress = walletAddressFromStore.find(
            (a) => a.address === address.dvm,
          );

          if (selectedAddress === address.dvm) {
            // change tab if selected address is from your addresses
            setActiveButtonGroup(ButtonGroupTabKey.YourAddress);
          }
          if (storedWalletAddress === undefined) {
            addresses.push({
              address: address.dvm,
              evmAddress: address.evm,
              label: address.generatedLabel,
            });
          } else {
            addresses.push({
              ...storedWalletAddress,
              // to support backward compatibility for already saved address
              evmAddress: storedWalletAddress.evmAddress ?? address.evm,
            });
          }
        });
        setWalletAddress(addresses);
      }
    });
    return () => {
      isSubscribed = false;
    };
  }, [wallet, addressLength, walletAddressFromStore]);

  // Search
  const [searchString, setSearchString] = useState("");
  const filterAddress = useCallback(
    debounce((searchString: string): void => {
      setFilteredAddressBook(
        sortByFavourite(addressBook).filter(
          (address) =>
            address.label
              .toLowerCase()
              .includes(searchString?.trim().toLowerCase()) ||
            address.address.includes(searchString?.trim().toLowerCase()),
        ),
      );
      setFilteredWalletAddress(
        walletAddress.filter(
          (address: LocalAddress) =>
            address.label
              .toLowerCase()
              .includes(searchString?.trim().toLowerCase()) ||
            address.address.includes(searchString?.trim().toLowerCase()) ||
            address.evmAddress.includes(searchString?.trim().toLowerCase()),
          // || (address.label === ""),
        ) as LocalAddress[],
      );
    }, 200),
    [addressBook, walletAddress, searchString, activeButtonGroup],
  );

  // Favourite
  const onFavouriteAddress = async (
    localAddress: WhitelistedAddress,
  ): Promise<void> => {
    const labeledAddress = {
      [localAddress.address]: {
        ...localAddress,
        isFavourite:
          typeof localAddress.isFavourite === "boolean"
            ? !localAddress.isFavourite
            : true,
      },
    };
    dispatch(userPreferences.actions.addToAddressBook(labeledAddress));
  };

  const sortByFavourite = (
    localAddresses: WhitelistedAddress[],
  ): WhitelistedAddress[] => {
    return [...localAddresses]
      .sort((curr, next) => {
        if (curr.isFavourite === true) {
          return -1;
        }
        if (next.isFavourite === true) {
          return 1;
        }
        return 0;
      })
      .sort((curr, next) => {
        if (
          isAddressSelectDisabled &&
          curr.addressDomainType === addressDomainType
        ) {
          return -1;
        }
        if (
          isAddressSelectDisabled &&
          next.addressDomainType === addressDomainType
        ) {
          return 1;
        }
        return 0;
      });
  };

  useEffect(() => {
    // sync all store changes to local storage
    const updateLocalStorage = async (): Promise<void> => {
      await dispatch(
        setUserPreferences({
          network,
          preferences: userPreferencesFromStore,
        }),
      );
    };
    updateLocalStorage().catch(Logging.error);
  }, [userPreferencesFromStore]);

  useEffect(() => {
    // update on search, on tab change
    if (searchString?.trim().length !== 0) {
      filterAddress(searchString);
      return;
    }
    if (activeButtonGroup === ButtonGroupTabKey.Whitelisted) {
      setFilteredAddressBook(sortByFavourite(addressBook));
    } else {
      setFilteredWalletAddress(walletAddress);
    }
  }, [
    addressBook,
    walletAddress,
    searchString,
    activeButtonGroup,
    addressDomainType,
  ]);

  useEffect(() => {
    navigation.setOptions({
      headerStyle: [
        ...(headerStyle as Array<StyleProp<ViewStyle>>),
        tailwind("rounded-b-none border-b-0"),
        { shadowOpacity: 0 },
      ],
    });
  }, []);

  const WhitelistedAddressItem = useCallback(
    ({
      selectedAddress,
      onAddressSelect,
      ...props
    }: {
      item: WhitelistedAddress;
      index: number;
      testIDSuffix: string;
      selectedAddress?: string;
      onAddressSelect?: (address: string) => void;
    }): JSX.Element => {
      const { item, index, testIDSuffix } = props;
      const isDisabledToSelect =
        isAddressSelectDisabled &&
        activeButtonGroup === ButtonGroupTabKey.Whitelisted &&
        (item as WhitelistedAddress).addressDomainType === addressDomainType &&
        addressDomainType === DomainType.EVM; // disable address selection if its from the same EVM domain

      const onChangeAddress = (addressDetail: WhitelistedAddress): void => {
        if (onAddressSelect) {
          onAddressSelect(addressDetail.address);
        }
      };

      const onDFIAddressClick = async () => {
        if (activeButtonGroup === ButtonGroupTabKey.Whitelisted) {
          setSearchString("");
          setIsSearchFocus(false);
          navigation.navigate({
            name: "AddOrEditAddressBookScreen",
            params: {
              title: "Address Details",
              isAddNew: false,
              address: item.address,
              addressDomainType: (item as WhitelistedAddress).addressDomainType,
              addressLabel: item,
              onSaveButtonPress: () => {},
            },
            merge: true,
          });
        } else {
          await openURL(getAddressUrl(item.address));
        }
      };

      return (
        <ThemedTouchableOpacityV2
          key={item.address}
          light={tailwind("bg-mono-light-v2-00")}
          dark={tailwind("bg-mono-dark-v2-00")}
          style={[
            tailwind("py-4.5 pl-5 pr-4 mb-2 rounded-lg-v2"),
            isDisabledToSelect && tailwind("opacity-30"),
          ]}
          testID={`address_row_${index}_${testIDSuffix}`}
          disabled={isDisabledToSelect}
          onPress={async () => onChangeAddress(item)}
        >
          <View
            style={tailwind("flex flex-row items-center flex-grow", {
              "flex-auto": Platform.OS === "web",
            })}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              style={tailwind("mr-4")}
              onPress={async () =>
                await onFavouriteAddress(item as WhitelistedAddress)
              }
              testID={`address_row_star_${index}_${testIDSuffix}`}
              disabled={isAddressSelectDisabled}
            >
              {item.isFavourite ? (
                <FavoriteCheckIcon
                  size={24}
                  testID={`address_row_${index}_is_favourite_${testIDSuffix}`}
                />
              ) : (
                <FavoriteUnCheckIcon
                  size={24}
                  testID={`address_row_${index}_not_favourite_${testIDSuffix}`}
                />
              )}
            </TouchableOpacity>

            <View style={tailwind("flex flex-row items-center flex-auto")}>
              <View style={tailwind("flex flex-auto mr-1")}>
                {item.label !== "" && (
                  <View style={tailwind("flex flex-row items-center")}>
                    <ThemedTextV2
                      style={tailwind(
                        "font-semibold-v2 text-sm min-w-0 w-10/12",
                      )}
                      testID={`address_row_label_${index}_${testIDSuffix}`}
                    >
                      {item.label}
                    </ThemedTextV2>
                    {(item as WhitelistedAddress).addressDomainType ===
                      DomainType.EVM && (
                      <EvmTag index={index} testIDSuffix={testIDSuffix} />
                    )}
                  </View>
                )}
                {/* for DFI address */}
                <WhitelistedAddressLink
                  address={item.address}
                  disabled={isAddressSelectDisabled}
                  testIDSuffix={`${index}_${testIDSuffix}`}
                  displayIcon={
                    activeButtonGroup === ButtonGroupTabKey.YourAddress
                  }
                  onClick={async () => onChangeAddress(item)}
                />
                {/* for EVM address */}
              </View>
              {!isAddressSelectDisabled && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onDFIAddressClick}
                  style={tailwind("flex flex-row items-center")}
                  testID={`address_row_${index}_${testIDSuffix}_caret`}
                >
                  <ThemedIcon
                    dark={tailwind("text-mono-dark-v2-700")}
                    light={tailwind("text-mono-light-v2-700")}
                    iconType="Feather"
                    name="chevron-right"
                    size={18}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ThemedTouchableOpacityV2>
      );
    },
    [filteredAddressBook, filteredWalletAddress, activeButtonGroup],
  );

  const YourAddressListItem = useCallback(
    ({
      selectedAddress,
      onAddressSelect,
      ...props
    }: {
      item: LocalAddress;
      index: number;
      testIDSuffix: string;
      selectedAddress?: string;
      onAddressSelect?: (address: string) => void;
    }): JSX.Element => {
      const { item, index, testIDSuffix } = props;

      const onChangeAddress = (addressDetail: string): void => {
        if (onAddressSelect) {
          onAddressSelect(addressDetail);
        }
      };

      const onDFIAddressClick = async () => {
        await openURL(getAddressUrl(item.address));
      };

      return (
        // Your Address card
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onChangeAddress(item.address)}
          disabled={isEvmFeatureEnabled}
        >
          <ThemedViewV2
            key={item.address}
            light={tailwind("bg-mono-light-v2-00")}
            dark={tailwind("bg-mono-dark-v2-00")}
            style={tailwind("py-4.5 pl-5 pr-4 mb-2 rounded-lg-v2 ")}
            testID={`address_row_${index}_${testIDSuffix}`}
          >
            <View
              style={tailwind("flex flex-row items-center flex-grow", {
                "flex-auto": Platform.OS === "web",
              })}
            >
              <View style={tailwind("flex flex-row items-center flex-auto")}>
                <View style={tailwind("flex flex-auto")}>
                  <View
                    style={tailwind(
                      "flex flex-row justify-between items-center",
                    )}
                  >
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={onDFIAddressClick}
                      style={tailwind("flex flex-row items-center")}
                    >
                      <ThemedTextV2
                        style={tailwind("font-semibold-v2 text-sm min-w-0")}
                        testID={`address_row_label_${index}_${testIDSuffix}`}
                      >
                        {item.label}
                      </ThemedTextV2>
                    </TouchableOpacity>
                    <RandomAvatar name={item.address} size={24} />
                  </View>

                  {/* DVM address card */}
                  <YourAddressLink
                    address={item.address}
                    testIDSuffix={`${index}_${testIDSuffix}`}
                    onClick={async () => {
                      onChangeAddress(item.address);
                    }}
                    isAddressSelectEnabled={false}
                  />
                  {/* EVM address card */}
                  {isEvmFeatureEnabled && (
                    <YourAddressLink
                      disabled={addressDomainType === DomainType.EVM}
                      testIDSuffix={`${index}_${testIDSuffix}_EVM`}
                      address={(item as LocalAddress).evmAddress}
                      isEvmAddress
                      onClick={async () => {
                        onChangeAddress(item.evmAddress);
                      }}
                      isAddressSelectEnabled={false}
                    />
                  )}
                </View>
              </View>
            </View>
          </ThemedViewV2>
        </TouchableOpacity>
      );
    },
    [filteredAddressBook, filteredWalletAddress, activeButtonGroup],
  );

  const goToAddAddressForm = (): void => {
    navigation.navigate({
      name: "AddOrEditAddressBookScreen",
      params: {
        title: "Add Address",
        isAddNew: true,
        addressDomainType,
        onSaveButtonPress: (address?: string) => {
          if (onAddressSelect !== undefined && address !== undefined) {
            onAddressSelect(address);
          }
        },
      },
      merge: true,
    });
  };

  return (
    <ThemedViewV2 style={tailwind("h-full")}>
      <ThemedViewV2
        light={tailwind("bg-mono-light-v2-00 border-mono-light-v2-100")}
        dark={tailwind("bg-mono-dark-v2-00 border-mono-dark-v2-100")}
        style={tailwind(
          "flex flex-col items-center pt-1 rounded-b-2xl border-b",
        )}
      >
        <View style={tailwind("w-full px-5")}>
          <ButtonGroup
            buttons={buttonGroup}
            activeButtonGroupItem={activeButtonGroup}
            testID="address_button_group"
            lightThemeStyle={tailwind("bg-transparent")}
            darkThemeStyle={tailwind("bg-transparent")}
          />
        </View>
      </ThemedViewV2>
      <ScrollView
        contentContainerStyle={tailwind("pb-8")}
        style={tailwind("px-5 h-full")}
      >
        <View style={tailwind("flex flex-row items-center mt-8")}>
          <View style={tailwind("flex-1")}>
            <SearchInput
              value={searchString}
              ref={searchRef}
              containerStyle={[
                tailwind("border-0.5"),
                tailwind(
                  isSearchFocus
                    ? {
                        "border-mono-light-v2-800": isLight,
                        "border-mono-dark-v2-800": !isLight,
                      }
                    : {
                        "border-mono-light-v2-00": isLight,
                        "border-mono-dark-v2-00": !isLight,
                      },
                ),
              ]}
              inputStyle={{
                light: tailwind("text-mono-light-v2-900"),
                dark: tailwind("text-mono-dark-v2-900"),
              }}
              placeholder={translate(
                "screens/AddressBookScreen",
                "Search address book",
              )}
              showClearButton={searchString !== ""}
              onClearInput={() => {
                setSearchString("");
                searchRef?.current?.focus();
              }}
              onChangeText={(text: string) => {
                setSearchString(text);
              }}
              onFocus={() => {
                setIsSearchFocus(true);
              }}
              onBlur={() => {
                setIsSearchFocus(false);
              }}
              testID="address_search_input"
            />
          </View>
          <View style={tailwind("ml-3")}>
            {activeButtonGroup === ButtonGroupTabKey.Whitelisted ? (
              <ThemedTouchableOpacityV2
                onPress={goToAddAddressForm}
                light={tailwind("bg-mono-light-v2-900")}
                dark={tailwind("bg-mono-dark-v2-900")}
                testID="add_new_address"
                style={tailwind(
                  "flex h-10 w-10 flex-row items-center justify-center rounded-full",
                )}
              >
                <ThemedIcon
                  size={24}
                  name="plus"
                  light={tailwind("text-mono-light-v2-00")}
                  dark={tailwind("text-mono-dark-v2-00")}
                  iconType="Feather"
                />
              </ThemedTouchableOpacityV2>
            ) : (
              <DiscoverWalletAddressV2 size={24} />
            )}
          </View>
        </View>
        {(isSearchFocus || searchString?.trim().length !== 0) && (
          <View style={tailwind("px-5 mt-6 mb-2")}>
            <ThemedTextV2
              light={tailwind("text-mono-light-v2-700")}
              dark={tailwind("text-mono-dark-v2-700")}
              style={tailwind("font-normal-v2 text-xs")}
              testID="search_title"
            >
              {searchString?.trim().length > 0
                ? translate(
                    "screens/AddressBookScreen",
                    "Search results for “{{input}}”",
                    { input: searchString?.trim() },
                  )
                : translate(
                    "screens/AddressBookScreen",
                    "Search with label or address",
                  )}
            </ThemedTextV2>
          </View>
        )}
        {activeButtonGroup === ButtonGroupTabKey.Whitelisted &&
        filteredAddressBook.length === 0 &&
        !isSearchFocus &&
        searchString?.trim().length === 0 ? (
          <EmptyDisplay onPress={goToAddAddressForm} />
        ) : (
          <>
            {/* Search address */}
            {!isSearchFocus && searchString?.trim().length === 0 && (
              <ThemedSectionTitleV2
                testID="addresses_title"
                text={translate("screens/AddressBookScreen", "ADDRESS(ES)")}
              />
            )}

            {/* wWhitelisted address tab */}
            {activeButtonGroup === ButtonGroupTabKey.Whitelisted &&
              filteredAddressBook.map(
                (item: WhitelistedAddress, index: number) => (
                  <WhitelistedAddressItem
                    item={item}
                    key={item.address}
                    index={index}
                    testIDSuffix="WHITELISTED"
                    selectedAddress={selectedAddress}
                    onAddressSelect={onAddressSelect}
                  />
                ),
              )}

            {/* Your address tab */}
            {activeButtonGroup === ButtonGroupTabKey.YourAddress &&
              filteredWalletAddress.map((item: LocalAddress, index: number) => (
                <YourAddressListItem
                  item={item}
                  key={item.address}
                  index={index}
                  testIDSuffix="YOUR_ADDRESS"
                  selectedAddress={selectedAddress}
                  onAddressSelect={onAddressSelect}
                />
              ))}
          </>
        )}
      </ScrollView>
    </ThemedViewV2>
  );
}

function EmptyDisplay({ onPress }: { onPress: () => void }): JSX.Element {
  const { isLight } = useThemeContext();
  return (
    <View
      style={tailwind("px-5 text-center mt-10")}
      testID="empty_address_book"
    >
      <View style={tailwind("items-center pb-8")}>
        <Image
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            width: 200,
            height: 136,
          }}
          source={isLight ? LightEmptyAddress : DarkEmptyAddress}
        />
      </View>
      <ThemedTextV2
        testID="empty_tokens_title"
        style={tailwind("text-xl font-semibold-v2 text-center")}
      >
        {translate("screens/AddressBookScreen", "No saved addresses")}
      </ThemedTextV2>
      <ThemedTextV2
        testID="empty_tokens_subtitle"
        style={tailwind("font-normal-v2 text-center mt-2")}
      >
        {translate(
          "screens/AddressBookScreen",
          "Add your preferred / commonly-used address.",
        )}
      </ThemedTextV2>
      <ButtonV2
        label={translate("screens/AddressBookScreen", "Add address")}
        onPress={onPress}
        testID="button_add_address"
        styleProps="mx-1 mt-11"
      />
    </View>
  );
}

export function DiscoverWalletAddressV2({
  size = 24,
}: {
  size?: number;
}): JSX.Element {
  const { discoverWalletAddresses } = useWalletContext();
  const { isLight } = useThemeContext();
  return (
    <ThemedTouchableOpacityV2
      onPress={discoverWalletAddresses}
      testID="discover_wallet_addresses"
      light={tailwind("bg-mono-light-v2-900")}
      dark={tailwind("bg-mono-dark-v2-900")}
      style={tailwind(
        "flex h-10 w-10 flex-row items-center justify-center rounded-full",
      )}
    >
      <RefreshIcon
        size={size}
        color={getColor(isLight ? "mono-light-v2-00" : "mono-dark-v2-00")}
      />
    </ThemedTouchableOpacityV2>
  );
}

function WhitelistedAddressLink({
  disabled,
  onClick,
  address,
  displayIcon,
  testIDSuffix,
}: {
  disabled: boolean;
  onClick: () => Promise<void>;
  address: string;
  displayIcon: boolean;
  testIDSuffix: string;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onClick}
      testID={`address_action_${address}`}
      style={tailwind("flex flex-row items-center")}
      disabled={disabled}
    >
      <ThemedTextV2
        style={tailwind("font-normal-v2 text-xs w-10/12 mt-1")}
        light={tailwind("text-mono-light-v2-700")}
        dark={tailwind("text-mono-dark-v2-700")}
        ellipsizeMode="middle"
        numberOfLines={1}
        testID={`address_row_text_${testIDSuffix}`}
      >
        {address}
      </ThemedTextV2>
      {!disabled && displayIcon && (
        <View style={tailwind("w-2/12")}>
          <ThemedIcon
            dark={tailwind("text-mono-dark-v2-700")}
            light={tailwind("text-mono-light-v2-700")}
            iconType="Feather"
            name="external-link"
            size={16}
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

function YourAddressLink({
  disabled,
  onClick,
  address,
  isEvmAddress,
  testIDSuffix,
  isAddressSelectEnabled,
}: {
  disabled?: boolean;
  onClick: () => Promise<void>;
  address: string;
  isEvmAddress?: boolean;
  testIDSuffix: string;
  isAddressSelectEnabled: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onClick}
      testID={`address_row_text_${testIDSuffix}`}
      style={[
        tailwind("flex flex-row justify-between items-center mt-4"),
        disabled && tailwind("opacity-30"),
      ]}
      disabled={disabled}
    >
      <View style={tailwind("flex flex-row w-10/12")}>
        <ThemedTextV2
          style={tailwind("font-normal-v2 text-sm w-10/12")}
          light={tailwind("text-mono-light-v2-700")}
          dark={tailwind("text-mono-dark-v2-700")}
          ellipsizeMode="middle"
          numberOfLines={1}
        >
          {address}
        </ThemedTextV2>
        {isEvmAddress && <EvmTag index={1} testIDSuffix={testIDSuffix} />}
      </View>
      {isAddressSelectEnabled && (
        <ThemedIcon
          testID={`address_row_${testIDSuffix}_caret`}
          light={tailwind("text-mono-light-v2-700")}
          dark={tailwind("text-mono-dark-v2-700")}
          iconType="Feather"
          name="chevron-right"
          size={24}
        />
      )}
    </TouchableOpacity>
  );
}
