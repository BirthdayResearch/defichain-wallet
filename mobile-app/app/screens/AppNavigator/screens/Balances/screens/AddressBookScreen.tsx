import { View } from '@components'
import { ThemedFlatList, ThemedIcon, ThemedText, ThemedTouchableOpacity, ThemedView } from '@components/themed'
import { StackScreenProps } from '@react-navigation/stack'
import { RootState, useAppDispatch } from '@store'
import { hasTxQueued } from '@store/transaction_queue'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { LabeledAddress, setAddressBook, setUserPreferences } from '@store/userPreferences'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { Platform, TouchableOpacity } from 'react-native'
import { useSelector } from 'react-redux'
import { BalanceParamList } from '../BalancesNavigator'
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
import { HeaderSearchIcon } from '@components/HeaderSearchIcon'
import { HeaderSearchInput } from '@components/HeaderSearchInput'
import { useDeFiScanContext } from '@shared-contexts/DeFiScanContext'
import { debounce } from 'lodash'
import { openURL } from '@api/linking'

type Props = StackScreenProps<BalanceParamList, 'AddressBookScreen'>

export function AddressBookScreen ({ route, navigation }: Props): JSX.Element {
  const { selectedAddress, onAddressSelect } = route.params
  const { network } = useNetworkContext()
  const dispatch = useAppDispatch()
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const userPreferences = useSelector((state: RootState) => state.userPreferences)
  const addressBook = userPreferences.addressBook
  const [isEditing, setIsEditing] = useState(false)
  const { getAddressUrl } = useDeFiScanContext()

  // Search
  const [showSearchInput, setShowSearchInput] = useState(false)
  const [searchString, setSearchString] = useState('')
  const filterAddress = debounce((searchString: string): void => {
    if (searchString?.trim().length > 0) {
      const addressBookList: string[] = []

      for (const address in addressBook) {
        if (address.includes(searchString.trim().toLowerCase()) || addressBook[address]?.label.toLowerCase().includes(searchString.trim().toLowerCase())) {
          addressBookList.push(address)
        }
      }
      setFilteredAddresses(addressBookList)
    } else {
      setFilteredAddresses([])
    }
  }, 200)

  // disable address selection touchableopacity from settings page
  const disableAddressSelect = selectedAddress === undefined && onAddressSelect === undefined

  const addresses = useMemo((): string[] => {
    if (addressBook === undefined) {
      return []
    }

    return Object.keys(addressBook)
  }, [addressBook])

  const onChangeAddress = (address: string): void => {
    if (hasPendingJob || hasPendingBroadcastJob) {
      return
    }
    // condition to make address component unclickable from settings page
    if (address !== undefined && onAddressSelect !== undefined) {
      onAddressSelect(address)
    }
  }
  const [filteredAddresses, setFilteredAddresses] = useState<string[]>(addresses)

  // to update edit/delete/add addresses
  useEffect(() => {
    setFilteredAddresses(addresses)
  }, [addresses])

  useEffect(() => {
    if (showSearchInput) {
      filterAddress(searchString) // filter while searching
    }
  }, [searchString])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: (): JSX.Element => {
        // don't display search icon if there are no addresses
        if (addresses.length > 0) {
          return (
            <HeaderSearchIcon
              onPress={() => {
                setShowSearchInput(true)
                setFilteredAddresses([])
              }}
              testID='address_search_icon'
            />
          )
        } else {
          return <></>
        }
      }
    })
  }, [navigation, showSearchInput, addresses])

  useEffect(() => {
    if (showSearchInput) {
      navigation.setOptions({
        header: (): JSX.Element => (
          <HeaderSearchInput
            searchString={searchString}
            onClearInput={() => setSearchString('')}
            onChangeInput={(text: string) => {
              setSearchString(text)
            }}
            onCancelPress={() => {
              setSearchString('')
              setShowSearchInput(false)
              setFilteredAddresses(addresses)
            }}
            placeholder={translate('screens/AddressBookScreen', 'Search for address')}
            testID='address_search_input'
          />
        )
      })
    } else {
      navigation.setOptions({
        header: undefined
      })
    }
  }, [showSearchInput, searchString, addresses])

  const AddressListItem = useCallback(({
    item,
    index
  }: { item: string, index: number }): JSX.Element => {
    return (
      <ThemedTouchableOpacity
        key={item}
        style={tailwind('px-4 py-3 flex flex-row items-center justify-between')}
        onPress={async () => {
          if (!isEditing) {
            onChangeAddress(item)
          }
        }}
        testID={`address_row_${index}`}
        disabled={hasPendingJob || hasPendingBroadcastJob || isEditing || disableAddressSelect}
      >
        <View style={tailwind('flex flex-row items-center flex-grow', { 'flex-auto': Platform.OS === 'web' })}>
          <View style={tailwind('mr-2 flex-auto')}>
            {addressBook?.[item]?.label != null && addressBook?.[item]?.label !== '' &&
              (
                <View style={tailwind('flex flex-row')}>
                  <ThemedText style={tailwind('text-sm')} testID={`address_row_label_${item}`}>
                    {addressBook[item]?.label}
                  </ThemedText>
                  {!isEditing && (
                    <ThemedIcon
                      size={16}
                      name='open-in-new'
                      iconType='MaterialIcons'
                      light={tailwind('text-primary-500')}
                      dark={tailwind('text-darkprimary-500')}
                      style={tailwind('pl-1 pt-0.5')}
                      onPress={async () => await openURL(getAddressUrl(item))}
                    />
                  )}
                </View>

              )}
            <ThemedText
              style={tailwind('text-sm w-full')}
              light={tailwind('text-gray-500')}
              dark={tailwind('text-gray-400')}
              ellipsizeMode='middle'
              numberOfLines={1}
              testID={`address_row_text_${item}`}
            >
              {item}
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
                    address: item,
                    addressLabel: {
                      label: addressBook[item]?.label,
                      isMine: false
                    },
                    onSaveButtonPress: (labelAddress: LabeledAddress) => {
                      dispatch(setAddressBook(labelAddress)).then(() => {
                        dispatch(setUserPreferences({
                          network,
                          preferences: {
                            ...userPreferences,
                            addressBook: labelAddress
                          }
                        }))
                      })
                      setIsEditing(false)
                      setShowSearchInput(false)
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
                    testID={`address_edit_indicator_${item}`}

                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={async () => await onDelete(item)}>
                  <ThemedIcon
                    size={24}
                    name='delete'
                    iconType='MaterialIcons'
                    light={tailwind('text-gray-600')}
                    dark={tailwind('text-gray-300')}
                    testID={`address_delete_indicator_${item}`}
                  />
                </TouchableOpacity>
              </>
            )
            : item === selectedAddress
              ? (
                <ThemedIcon
                  size={24}
                  name='check'
                  iconType='MaterialIcons'
                  light={tailwind('text-success-600')}
                  dark={tailwind('text-darksuccess-600')}
                  testID={`address_active_indicator_${item}`}
                />
              )
              : (
                <View style={tailwind('h-6 w-6')} />
              )}
        </View>
      </ThemedTouchableOpacity>
    )
  }, [addressBook, isEditing])

  const goToAddAddressForm = (): void => {
    navigation.navigate({
      name: 'AddOrEditAddressBookScreen',
      params: {
        title: 'Add New Address',
        isAddNew: true,
        onSaveButtonPress: (labelAddress: LabeledAddress, address?: string) => {
          const _addressBook = { ...addressBook, ...labelAddress }
          dispatch(setAddressBook(_addressBook)).then(() => {
            dispatch(setUserPreferences({
              network,
              preferences: {
                ...userPreferences,
                addressBook: _addressBook
              }
            }))
          })
          if (onAddressSelect !== undefined && address !== undefined) {
            onAddressSelect(address)
          }
        }
      },
      merge: true
    })
  }

  const HeaderComponent = useMemo(() => {
    if (addresses.length === 0) {
      return <></>
    }

    return (
      <ThemedView
        light={tailwind('bg-gray-50 border-gray-200')}
        dark={tailwind('bg-gray-900 border-gray-700')}
        style={tailwind('flex flex-col items-center px-4 pt-6 pb-2 border-b')}
      >
        <View style={tailwind('flex flex-row items-center justify-between w-full')}>
          <WalletCounterDisplay addressLength={addresses.length} />
          {addresses.length > 0 &&
            <AddressListEditButton isEditing={isEditing} handleOnPress={() => setIsEditing(!isEditing)} />}
        </View>
      </ThemedView>
    )
  }, [addresses, isEditing])

  const FooterComponent = useMemo(() => {
    if (addresses.length === 0) {
      return <></>
    }

    return (
      <ThemedTouchableOpacity
        light={tailwind('bg-white border-gray-200')}
        dark={tailwind('bg-gray-800 border-gray-700')}
        style={tailwind('py-3 pl-4 pr-2 border-b')}
        onPress={goToAddAddressForm}
        testID='add_new_address'
      >
        <View style={tailwind('flex-row items-center flex-grow')}>
          <ThemedIcon
            size={20}
            name='add'
            dark={tailwind('text-darkprimary-500')}
            light={tailwind('text-primary-500')}
            style={tailwind('font-normal')}
            iconType='MaterialIcons'
          />

          <View style={tailwind('mx-2 flex-auto')}>
            <ThemedText
              dark={tailwind('text-darkprimary-500')}
              light={tailwind('text-primary-500')}
              style={tailwind('font-medium')}
            >
              {translate('screens/AddressBookScreen', 'Add address')}
            </ThemedText>
          </View>
        </View>
      </ThemedTouchableOpacity>
    )
  }, [addresses, addressBook])

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
        const { [address]: _, ..._addressBook } = addressBook
        dispatch(setAddressBook(_addressBook)).then(() => {
          dispatch(setUserPreferences({
            network,
            preferences: {
              ...userPreferences,
              addressBook: _addressBook
            }
          }))
        })
        setIsEditing(false)
        setShowSearchInput(false)
        setSearchString('')
      },
      onError: e => logger.error(e),
      title: translate('screens/Settings', 'Sign to delete address'),
      message: translate('screens/Settings', 'Enter passcode to continue'),
      loading: translate('screens/Settings', 'Verifying access')
    }
    dispatch(authentication.actions.prompt(auth))
  }, [navigation, dispatch, isEncrypted, addressBook])

  return (
    <ThemedFlatList
      light={tailwind('bg-gray-50')}
      keyExtractor={(item) => item}
      stickyHeaderIndices={[0]}
      data={filteredAddresses}
      renderItem={AddressListItem} // Address list
      ListHeaderComponent={showSearchInput ? <></> : HeaderComponent} // Address counter
      ListFooterComponent={showSearchInput ? <></> : FooterComponent} // + Add new address
      ListEmptyComponent={addresses.length > 0 ? <></> : <EmptyDisplay onPress={goToAddAddressForm} />}
    />
  )
}

function EmptyDisplay ({ onPress }: { onPress: () => void }): JSX.Element {
  const { isLight } = useThemeContext()
  return (
    <ThemedView
      style={tailwind('px-8 pt-32 pb-2 text-center')}
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
      style={tailwind('text-xs font-medium mr-1.5')}
      testID='address_detail_address_count'
    >
      {translate('screens/AddressBookScreen', '{{length}} ADDRESS(ES)', { length: addressLength })}
    </ThemedText>
  )
}
