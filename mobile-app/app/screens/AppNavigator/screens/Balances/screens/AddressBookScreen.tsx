import { View } from '@components'
import { ThemedFlatList, ThemedIcon, ThemedText, ThemedTouchableOpacity, ThemedView } from '@components/themed'
import { StackScreenProps } from '@react-navigation/stack'
import { RootState, useAppDispatch } from '@store'
import { hasTxQueued } from '@store/transaction_queue'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { LabeledAddress, setAddressBook, setUserPreferences } from '@store/userPreferences'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { useCallback, useMemo, useState } from 'react'
import { Platform, TouchableOpacity } from 'react-native'
import { useSelector } from 'react-redux'
import { BalanceParamList } from '../BalancesNavigator'
import { RandomAvatar } from '../components/RandomAvatar'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { NoTokensLight } from '../assets/NoTokensLight'
import { NoTokensDark } from '../assets/NoTokensDark'
import { AddressListEditButton } from '../components/AddressListEditButton'
import { useWalletNodeContext } from '@shared-contexts/WalletNodeProvider'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { MnemonicStorage } from '@api/wallet/mnemonic_storage'
import { authentication, Authentication } from '@store/authentication'

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
    onAddressSelect(address)
  }

  const AddressListItem = useCallback(({
    item,
    index
  }: { item: string, index: number }): JSX.Element => {
    return (
      <ThemedTouchableOpacity
        key={item}
        style={tailwind('p-4 flex flex-row items-center justify-between')}
        onPress={async () => {
          if (!isEditing) {
            onChangeAddress(item)
          }
        }}
        testID={`address_row_${index}`}
        disabled={hasPendingJob || hasPendingBroadcastJob || isEditing}
      >
        <View style={tailwind('flex flex-row items-center flex-grow', { 'flex-auto': Platform.OS === 'web' })}>
          <RandomAvatar name={item} size={32} />
          <View style={tailwind('mx-2 flex-auto')}>
            {addressBook?.[item]?.label != null && addressBook?.[item]?.label !== '' &&
              (
                <ThemedText style={tailwind('text-sm w-full font-medium')} testID={`address_row_label_${item}`}>
                  {addressBook[item]?.label}
                </ThemedText>
              )}
            <ThemedText
              style={tailwind('text-sm w-full')}
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
                    title: 'Edit address',
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
                    }
                  },
                  merge: true
                })}
                >
                  <ThemedIcon
                    size={24}
                    name='edit'
                    iconType='MaterialIcons'
                    style={tailwind('mr-2')}
                    light={tailwind('text-primary-500')}
                    dark={tailwind('text-darkprimary-500')}
                    testID={`address_edit_indicator_${item}`}

                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={async () => await onDelete(item)}>
                  <ThemedIcon
                    size={24}
                    name='delete'
                    iconType='MaterialIcons'
                    light={tailwind('text-primary-500')}
                    dark={tailwind('text-darkprimary-500')}
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

  const HeaderComponent = useMemo(() => {
    return (
      <ThemedView
        light={tailwind('bg-gray-50 border-gray-200')}
        dark={tailwind('bg-gray-900 border-gray-700')}
        style={tailwind('flex flex-col items-center px-4 pt-6 pb-2 border-b')}
      >
        <View style={tailwind('flex-row justify-between w-full mb-3')}>
          <ThemedText
            style={tailwind('text-xl font-semibold')}
            testID='address_book_title'
          >
            {translate('screens/AddressBookScreen', 'Address book')}
          </ThemedText>
        </View>
        <View style={tailwind('flex flex-row items-center justify-between w-full')}>
          <WalletCounterDisplay addressLength={addresses.length} />
          {addresses.length > 0 &&
            <AddressListEditButton isEditing={isEditing} handleOnPress={() => setIsEditing(!isEditing)} />}
        </View>
      </ThemedView>
    )
  }, [addresses, isEditing])

  const FooterComponent = useMemo(() => {
    return (
      <ThemedTouchableOpacity
        light={tailwind('bg-white border-gray-200')}
        dark={tailwind('bg-gray-800 border-gray-700')}
        style={tailwind('py-4 pl-4 pr-2 border-b')}
        onPress={() => {
          navigation.navigate({
            name: 'AddOrEditAddressBookScreen',
            params: {
              title: 'Add new address',
              isAddNew: true,
              onSaveButtonPress: (labelAddress: LabeledAddress) => {
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
              }
            },
            merge: true
          })
        }}
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

          <View style={tailwind('mx-3 flex-auto')}>
            <ThemedText
              dark={tailwind('text-darkprimary-500')}
              light={tailwind('text-primary-500')}
              style={tailwind('text-sm font-normal')}
            >
              {translate('screens/AddressBookScreen', 'ADD NEW ADDRESS')}
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
      data={addresses}
      renderItem={AddressListItem}
      ListHeaderComponent={HeaderComponent}
      ListFooterComponent={FooterComponent}
      ListEmptyComponent={EmptyDisplay}
    />
  )
}

function EmptyDisplay (): JSX.Element {
  const { isLight } = useThemeContext()
  return (
    <ThemedView
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-gray-800 border-gray-700')}
      style={tailwind('px-8 pt-8 pb-2 text-center border-b')}
      testID='empty_address_book'
    >
      <View style={tailwind('items-center pb-4')}>
        {
          isLight ? <NoTokensLight /> : <NoTokensDark />
        }
      </View>
      <ThemedText testID='empty_tokens_title' style={tailwind('text-lg pb-1 font-semibold text-center')}>
        {translate('screens/AddressBookScreen', 'Empty address book')}
      </ThemedText>
      <ThemedText testID='empty_tokens_subtitle' style={tailwind('text-sm px-8 pb-4 text-center opacity-60')}>
        {translate('screens/AddressBookScreen', 'Add your preferred address')}
      </ThemedText>
    </ThemedView>
  )
}

function WalletCounterDisplay ({ addressLength }: { addressLength: number }): JSX.Element {
  return (
    <ThemedText
      light={tailwind('text-gray-400')}
      dark={tailwind('text-gray-500')}
      style={tailwind('text-xs mr-1.5')}
      testID='address_detail_address_count'
    >
      {translate('screens/AddressBookScreen', '{{length}} ADDRESS(ES)', { length: addressLength })}
    </ThemedText>
  )
}
