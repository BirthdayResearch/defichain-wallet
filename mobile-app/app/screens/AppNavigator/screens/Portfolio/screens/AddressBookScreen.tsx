import { View } from '@components'
import { ThemedFlatList, ThemedIcon, ThemedSectionTitle, ThemedText, ThemedTouchableOpacity, ThemedView } from '@components/themed'
import { StackScreenProps } from '@react-navigation/stack'
import { RootState } from '@store'
import { hasTxQueued } from '@store/transaction_queue'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { LocalAddress, selectAddressBookArray, selectLocalWalletAddressArray, setUserPreferences, userPreferences } from '@store/userPreferences'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Keyboard, Platform, TouchableOpacity, ScrollView } from 'react-native'
import { useSelector } from 'react-redux'
import { PortfolioParamList } from '../PortfolioNavigator'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { NoTokensLight } from '../assets/NoTokensLight'
import { NoTokensDark } from '../assets/NoTokensDark'
import { AddressListEditButton } from '../components/AddressListEditButton'
import { useWalletNodeContext } from '@shared-contexts/WalletNodeProvider'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { MnemonicStorage } from '@api/wallet/mnemonic_storage'
import { authentication, Authentication } from '@store/authentication'
import { Button } from '@components/Button'
import { useDeFiScanContext } from '@shared-contexts/DeFiScanContext'
import { debounce } from 'lodash'
import { openURL } from '@api/linking'
import { SearchInput } from '@components/SearchInput'
import { ButtonGroup } from '../../Dex/components/ButtonGroup'
import { DiscoverWalletAddress } from '../components/AddressControlScreen'
import { Logging } from '@api'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { RandomAvatar } from '../components/RandomAvatar'
import { useWalletAddress } from '@hooks/useWalletAddress'
import { useAppDispatch } from '@hooks/useAppDispatch'

type Props = StackScreenProps<PortfolioParamList, 'AddressBookScreen'>

export enum ButtonGroupTabKey {
  Whitelisted = 'WHITELISTED',
  YourAddress = 'YOUR_ADDRESS'
}

export function AddressBookScreen ({ route, navigation }: Props): JSX.Element {
  const { selectedAddress, onAddressSelect } = route.params
  const { network } = useNetworkContext()
  const dispatch = useAppDispatch()
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const userPreferencesFromStore = useSelector((state: RootState) => state.userPreferences)
  const addressBook: LocalAddress[] = useSelector((state: RootState) => selectAddressBookArray(state.userPreferences))
  const walletAddressFromStore: LocalAddress[] = useSelector((state: RootState) => selectLocalWalletAddressArray(state.userPreferences)) // not all wallet address are stored in userPreference
  const [walletAddress, setWalletAddress] = useState<LocalAddress[]>(walletAddressFromStore) // combine labeled wallet address with jellyfish's api wallet
  const [isEditing, setIsEditing] = useState(false)
  const [isSearchFocus, setIsSearchFocus] = useState(false)
  const [favouriteAddress, setFavouriteAddress] = useState(addressBook.filter(address => address.isFavourite === true))
  const { getAddressUrl } = useDeFiScanContext()
  const {
    wallet,
    addressLength
  } = useWalletContext()
  const { fetchWalletAddresses } = useWalletAddress()
  const [filteredAddressBook, setFilteredAddressBook] = useState<LocalAddress[]>(addressBook)
  const [filteredWalletAddress, setFilteredWalletAddress] = useState<LocalAddress[]>(walletAddress)

  const buttonGroup = [
    {
      id: ButtonGroupTabKey.Whitelisted,
      label: translate('screens/AddressBookScreen', 'Whitelisted'),
      handleOnPress: () => onButtonGroupChange(ButtonGroupTabKey.Whitelisted)
    },
    {
      id: ButtonGroupTabKey.YourAddress,
      label: translate('screens/AddressBookScreen', 'Your address(es)'),
      handleOnPress: () => onButtonGroupChange(ButtonGroupTabKey.YourAddress)
    }
  ]
  const [activeButtonGroup, setActiveButtonGroup] = useState<ButtonGroupTabKey>(ButtonGroupTabKey.Whitelisted)

  const onButtonGroupChange = (buttonGroupTabKey: ButtonGroupTabKey): void => {
    setActiveButtonGroup(buttonGroupTabKey)
    setIsEditing(false)
  }

  useEffect(() => {
    // combine redux store and jellyfish wallet
    let isSubscribed = true
    void fetchWalletAddresses().then((walletAddresses) => {
      if (isSubscribed) {
        const addresses: LocalAddress[] = []
        walletAddresses.forEach((address) => {
          const storedWalletAddress = walletAddressFromStore.find(a => a.address === address)
          if (selectedAddress === address) {
            // change tab if selected address is from your addresses
            setActiveButtonGroup(ButtonGroupTabKey.YourAddress)
          }
          if (storedWalletAddress === undefined) {
            addresses.push({
              address,
              label: '',
              isMine: true
            })
          } else {
            addresses.push(storedWalletAddress)
          }
        })
        setWalletAddress(addresses)
      }
    })
    return () => {
      isSubscribed = false
    }
  }, [wallet, addressLength, walletAddressFromStore])

  // Search
  const [searchString, setSearchString] = useState('')
  const filterAddress = useCallback(debounce((searchString: string): void => {
    setFilteredAddressBook(sortByFavourite(addressBook).filter(address =>
      address.label.toLowerCase().includes(searchString.trim().toLowerCase()) ||
      address.address.includes(searchString.trim().toLowerCase())
    ))
    setFilteredWalletAddress(sortByFavourite(walletAddress).filter(address =>
      address.label.toLowerCase().includes(searchString.trim().toLowerCase()) ||
      address.address.includes(searchString.trim().toLowerCase())
    ))
  }, 200), [addressBook, walletAddress, activeButtonGroup])

  // disable address selection touchableopacity from settings page
  const disableAddressSelect = selectedAddress === undefined && onAddressSelect === undefined

  const onChangeAddress = (address: string): void => {
    if (hasPendingJob || hasPendingBroadcastJob) {
      return
    }
    // condition to make address component unclickable from settings page
    if (address !== undefined && onAddressSelect !== undefined) {
      onAddressSelect(address)
    }
  }

  // Favourite
  const onFavouriteAddress = async (localAddress: LocalAddress): Promise<void> => {
    const labeledAddress = {
      [localAddress.address]: {
        ...localAddress,
        isFavourite: typeof localAddress.isFavourite === 'boolean' ? !localAddress.isFavourite : true
      }
    }
    dispatch(userPreferences.actions.addToAddressBook(labeledAddress))
  }

  const sortByFavourite = (localAddresses: LocalAddress[]): LocalAddress[] => {
    return [...localAddresses].sort((curr, next) => {
      if (curr.isFavourite === true) {
        return -1
      }
      if (next.isFavourite === true) {
        return 1
      }
      return 0
    })
  }

  useEffect(() => {
    // sync all store changes to local storage
    const updateLocalStorage = async (): Promise<void> => {
      await dispatch(setUserPreferences({ network, preferences: userPreferencesFromStore }))
    }
    updateLocalStorage().catch(Logging.error)
  }, [userPreferencesFromStore])

  useEffect(() => {
    // update on search, on tab change
    if (searchString.trim().length !== 0) {
      filterAddress(searchString)
      return
    }

    activeButtonGroup === ButtonGroupTabKey.Whitelisted
    ? setFilteredAddressBook(sortByFavourite(addressBook))
    : setFilteredWalletAddress(sortByFavourite(walletAddress))
  }, [addressBook, walletAddress, searchString, activeButtonGroup])

  useEffect(() => {
    navigation.setOptions({
      headerTitle: (): JSX.Element => (
        <SearchInput
          value={searchString}
          placeholder={translate('screens/AddressBookScreen', 'Search address book')}
          showClearButton={searchString !== ''}
          onClearInput={() => setSearchString('')}
          onChangeText={(text: string) => {
            setSearchString(text)
          }}
          onFocus={() => {
            setIsSearchFocus(true)
            setIsEditing(false)
          }}
          testID='address_search_input'
        />
      ),
      headerRight: (): JSX.Element => {
        return !isSearchFocus
        ? (
          <TouchableOpacity
            onPress={goToAddAddressForm}
            testID='add_new_address'
            disabled={activeButtonGroup === ButtonGroupTabKey.YourAddress}
          >
            <ThemedIcon
              size={28}
              name='plus'
              style={tailwind('mr-2')}
              light={tailwind(['text-primary-500', { 'text-gray-300': activeButtonGroup === ButtonGroupTabKey.YourAddress }])}
              dark={tailwind(['text-darkprimary-500', { 'text-gray-600': activeButtonGroup === ButtonGroupTabKey.YourAddress }])}
              iconType='MaterialCommunityIcons'
            />
          </TouchableOpacity>
        )
        : (
          <TouchableOpacity
            onPress={() => {
              Keyboard.dismiss()
              setIsSearchFocus(false)
              setSearchString('')
            }}
            testID='cancel_search_button'
          >
            <ThemedIcon
              size={28}
              name='close'
              style={tailwind('mr-2')}
              light={tailwind('text-primary-500')}
              dark={tailwind('text-darkprimary-500')}
              iconType='MaterialCommunityIcons'
            />
          </TouchableOpacity>
        )
      }
    })
  }, [searchString, activeButtonGroup, isSearchFocus])

  useEffect(() => {
    setFavouriteAddress(addressBook.filter(address => address.isFavourite === true))
  }, [addressBook])

  const AddressListItem = useCallback(({
    item,
    index,
    testIDSuffix
  }: { item: LocalAddress, index: number, testIDSuffix: string }): JSX.Element => {
    return (
      <ThemedTouchableOpacity
        key={item.address}
        style={tailwind('px-4 py-3 flex flex-row items-center justify-between')}
        onPress={async () => {
          if (!isEditing) {
            onChangeAddress(item.address)
          }
        }}
        testID={`address_row_${index}_${testIDSuffix}`}
        disabled={hasPendingJob || hasPendingBroadcastJob || isEditing || disableAddressSelect}
      >
        <View style={tailwind('flex flex-row items-center flex-grow', { 'flex-auto': Platform.OS === 'web' })}>
          {item.isMine &&
            <View style={tailwind('mr-2')}>
              <RandomAvatar name={item.address} size={24} />
            </View>}
          <View style={tailwind('mr-2 flex-auto')}>
            <View style={tailwind('flex flex-row items-center')}>
              {item.label !== '' &&
                <ThemedText style={tailwind('text-sm pr-1')} testID={`address_row_label_${index}_${testIDSuffix}`}>
                  {item.label}
                </ThemedText>}
              {!isEditing && (
                <ThemedIcon
                  size={16}
                  name='open-in-new'
                  iconType='MaterialIcons'
                  light={tailwind('text-primary-500')}
                  dark={tailwind('text-darkprimary-500')}
                  onPress={async () => await openURL(getAddressUrl(item.address))}
                />
              )}
            </View>
            <ThemedText
              style={tailwind('text-sm w-full')}
              light={tailwind('text-gray-500')}
              dark={tailwind('text-gray-400')}
              ellipsizeMode='middle'
              numberOfLines={1}
              testID={`address_row_text_${index}_${testIDSuffix}`}
            >
              {item.address}
            </ThemedText>
          </View>
          {isEditing
            ? (
              <>
                <TouchableOpacity onPress={() => navigation.navigate({
                  name: 'AddOrEditAddressBookScreen',
                  params: {
                    title: 'Edit Address',
                    isAddNew: false,
                    address: item.address,
                    addressLabel: item,
                    onSaveButtonPress: () => {
                      setIsEditing(false)
                      setSearchString('')
                    }
                  },
                  merge: true
                })}
                >
                  <ThemedIcon
                    size={24}
                    name='edit'
                    iconType='MaterialIcons'
                    style={tailwind('mr-2 font-bold')}
                    light={tailwind('text-gray-600')}
                    dark={tailwind('text-gray-300')}
                    testID={`address_edit_indicator_${item.address}`}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={async () => await onDelete(item.address)}>
                  <ThemedIcon
                    size={24}
                    name='delete'
                    iconType='MaterialIcons'
                    light={tailwind('text-gray-600')}
                    dark={tailwind('text-gray-300')}
                    testID={`address_delete_indicator_${item.address}`}
                  />
                </TouchableOpacity>
              </>
            )
            : item.address === selectedAddress
              ? (
                <ThemedIcon
                  size={24}
                  name='check'
                  iconType='MaterialIcons'
                  light={tailwind('text-success-600')}
                  dark={tailwind('text-darksuccess-600')}
                  testID={`address_active_indicator_${item.address}`}
                />
              )
              : !item.isMine && (
                <TouchableOpacity
                  style={tailwind('pl-4 py-2')}
                  onPress={async () => await onFavouriteAddress(item)}
                  testID={`address_row_favourite_${index}_${testIDSuffix}`}
                >
                  <ThemedIcon
                    iconType='MaterialIcons'
                    name={item.isFavourite === true ? 'star' : 'star-outline'}
                    size={20}
                    light={tailwind(
                      item.isFavourite === true ? 'text-warning-500' : 'text-gray-600'
                    )}
                    dark={tailwind(
                      item.isFavourite === true ? 'text-darkwarning-500' : 'text-gray-300'
                    )}
                    testID={item.isFavourite === true ? `address_row_${index}_is_favourite_${testIDSuffix}` : `address_row_${index}_not_favourite_${testIDSuffix}`}
                  />
                </TouchableOpacity>
              )}
        </View>
      </ThemedTouchableOpacity>
    )
  }, [filteredAddressBook, filteredWalletAddress, isEditing, activeButtonGroup])

  const goToAddAddressForm = (): void => {
    setIsEditing(false)
    navigation.navigate({
      name: 'AddOrEditAddressBookScreen',
      params: {
        title: 'Add New Address',
        isAddNew: true,
        onSaveButtonPress: (address?: string) => {
          if (onAddressSelect !== undefined && address !== undefined) {
            onAddressSelect(address)
          }
        }
      },
      merge: true
    })
  }

  const HeaderComponent = useMemo(() => {
    return (
      <ThemedView
        light={tailwind('bg-gray-50 border-gray-200')}
        dark={tailwind('bg-gray-900 border-gray-700')}
        style={tailwind('flex flex-col items-center px-4 pt-6 pb-2 border-b')}
      >
        <View style={tailwind('mb-4 w-full')}>
          <ButtonGroup
            buttons={buttonGroup}
            activeButtonGroupItem={activeButtonGroup}
            labelStyle={tailwind('font-medium text-xs text-center py-0.5')}
            testID='address_button_group'
          />
        </View>
        <View style={tailwind('flex flex-row items-center justify-between w-full')}>
          <View style={tailwind('flex flex-row items-center')}>
            <WalletCounterDisplay addressLength={activeButtonGroup === ButtonGroupTabKey.Whitelisted ? filteredAddressBook.length : filteredWalletAddress.length} />
            {activeButtonGroup === ButtonGroupTabKey.YourAddress && <DiscoverWalletAddress size={18} />}
          </View>
          {(addressBook.length > 0 && activeButtonGroup === ButtonGroupTabKey.Whitelisted) &&
            <AddressListEditButton isEditing={isEditing} handleOnPress={() => setIsEditing(!isEditing)} />}
        </View>
      </ThemedView>
    )
  }, [filteredAddressBook, filteredWalletAddress, isEditing, activeButtonGroup])

  // Passcode prompt
  const { data: { type: encryptionType } } = useWalletNodeContext()
  const isEncrypted = encryptionType === 'MNEMONIC_ENCRYPTED'
  const logger = useLogger()
  const onDelete = useCallback(async (address: string): Promise<void> => {
    if (!isEncrypted) {
      return
    }

    const auth: Authentication<string[]> = {
      consume: async passphrase => await MnemonicStorage.get(passphrase),
      onAuthenticated: async () => {
        dispatch(userPreferences.actions.deleteFromAddressBook(address))
        setIsEditing(false)
        setSearchString('')
      },
      onError: e => logger.error(e),
      title: translate('screens/Settings', 'Sign to delete address'),
      message: translate('screens/Settings', 'Enter passcode to continue'),
      loading: translate('screens/Settings', 'Verifying access')
    }
    dispatch(authentication.actions.prompt(auth))
  }, [navigation, dispatch, isEncrypted])

  if (isSearchFocus) {
    return (
      <ThemedView style={tailwind('flex-1')}>
        <View style={tailwind('pt-6 px-4')}>
          {searchString.trim().length === 0
            ? (
              <ThemedText
                style={tailwind('text-sm')}
                light={tailwind('text-gray-500')}
                dark={tailwind('text-gray-400')}
              >
                {translate('screens/AddressBookScreen', 'Search with label or address')}
              </ThemedText>
            )
            : (
              <SearchResultTextWithCounter searchString={searchString} length={filteredAddressBook.length + filteredWalletAddress.length} />
            )}
        </View>
        {searchString.trim().length === 0 && favouriteAddress.length > 0 &&
          (
            <ThemedFlatList
              data={favouriteAddress}
              renderItem={({ item, index }) => AddressListItem({
              item,
              index,
              testIDSuffix: 'favourite_address'
            })}
              ListHeaderComponent={() => (
                <ThemedSectionTitle text={translate('screens/AddressBookScreen', 'FAVOURITE ADDRESS(ES)')} />
            )}
            />
        )}
        {searchString.trim().length > 0 &&
          (
            <ScrollView contentContainerStyle={tailwind('pb-8')}>
              {filteredAddressBook.length !== 0 && <ThemedSectionTitle text={translate('screens/AddressBookScreen', 'WHITELISTED')} />}
              {filteredAddressBook.map((item: LocalAddress, index: number) => (
                <AddressListItem
                  item={item}
                  key={index}
                  index={index}
                  testIDSuffix='address_book'
                />)
              )}
              {filteredWalletAddress.length !== 0 && <ThemedSectionTitle text={translate('screens/AddressBookScreen', 'YOUR ADDRESS(ES)')} />}
              {filteredWalletAddress.map((item: LocalAddress, index: number) => (
                <AddressListItem
                  item={item}
                  key={index}
                  index={index}
                  testIDSuffix='wallet_address'
                />)
              )}
            </ScrollView>
          )}
      </ThemedView>
    )
  }
  return (
    <ThemedFlatList
      light={tailwind('bg-gray-50')}
      keyExtractor={(item) => item.address}
      stickyHeaderIndices={[0]}
      data={activeButtonGroup === ButtonGroupTabKey.Whitelisted ? filteredAddressBook : filteredWalletAddress}
      renderItem={({ item, index }) => AddressListItem({
        item,
        index,
        testIDSuffix: `${activeButtonGroup}`
      })}
      ListHeaderComponent={HeaderComponent} // Address counter
      ListEmptyComponent={activeButtonGroup === ButtonGroupTabKey.Whitelisted && filteredAddressBook.length === 0 ? <EmptyDisplay onPress={goToAddAddressForm} /> : <></>}
    />
  )
}

function EmptyDisplay ({ onPress }: { onPress: () => void }): JSX.Element {
  const { isLight } = useThemeContext()
  return (
    <ThemedView
      style={tailwind('px-8 pt-24 pb-2 text-center')}
      testID='empty_address_book'
    >
      <View style={tailwind('items-center pb-4')}>
        {
          isLight ? <NoTokensLight /> : <NoTokensDark />
        }
      </View>
      <ThemedText testID='empty_tokens_title' style={tailwind('text-2xl font-semibold text-center')}>
        {translate('screens/AddressBookScreen', 'No saved addresses')}
      </ThemedText>
      <ThemedText testID='empty_tokens_subtitle' style={tailwind('px-8 pb-4 text-center opacity-60')}>
        {translate('screens/AddressBookScreen', 'Add your preferred address')}
      </ThemedText>
      <Button
        label={translate('screens/AddressBookScreen', 'ADD ADDRESS')}
        onPress={onPress}
        testID='button_add_address'
        title='Add address'
        margin='m-0 mb-4'
      />
    </ThemedView>
  )
}

function WalletCounterDisplay ({ addressLength }: { addressLength: number }): JSX.Element {
  return (
    <ThemedText
      light={tailwind('text-gray-400')}
      dark={tailwind('text-gray-500')}
      style={tailwind('text-xs font-medium mr-1.5 my-0.5')}
      testID='address_detail_address_count'
    >
      {translate('screens/AddressBookScreen', '{{length}} ADDRESS(ES)', { length: addressLength })}
    </ThemedText>
  )
}

function SearchResultTextWithCounter ({ searchString, length }: {searchString: string, length: number}): JSX.Element {
  return (
    <View
      style={tailwind('justify-between flex-row items-center')}
    >
      <View style={tailwind('w-10/12')}>
        <ThemedText
          light={tailwind('text-gray-900')}
          dark={tailwind('text-gray-50')}
          style={tailwind('text-sm')}
          ellipsizeMode='middle'
          numberOfLines={1}
        >
          {translate('screens/AddressBookScreen', 'Search results for')}
          <ThemedText
            light={tailwind('text-gray-900')}
            dark={tailwind('text-gray-50')}
            style={tailwind('text-sm font-medium')}
            testID='search_result_text_search_string'
          >
            {` “${searchString}”`}
          </ThemedText>
        </ThemedText>
      </View>
      <ThemedText
        light={tailwind('text-gray-400')}
        dark={tailwind('text-gray-500')}
        style={tailwind('text-xs')}
        testID='search_result_count'
      >
        {translate('screens/AddressBookScreen', '{{length}} results', { length })}
      </ThemedText>
    </View>
  )
}
