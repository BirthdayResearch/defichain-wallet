import { MnemonicStorage } from '@api/wallet/mnemonic_storage'
import { ThemedIcon, ThemedScrollViewV2, ThemedTextV2, ThemedTouchableOpacityV2 } from '@components/themed'
import { fromAddress } from '@defichain/jellyfish-address'
import { useWalletAddress } from '@hooks/useWalletAddress'
import { useAppDispatch } from '@hooks/useAppDispatch'
import { StackScreenProps } from '@react-navigation/stack'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { useWalletNodeContext } from '@shared-contexts/WalletNodeProvider'
import { RootState } from '@store'
import { authentication, Authentication } from '@store/authentication'
import { userPreferences } from '@store/userPreferences'
import { tailwind } from '@tailwind'
import { openURL } from '@api/linking'
import { translate } from '@translations'
import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { SettingsParamList } from '../../Settings/SettingsNavigatorV2'
import { WalletTextInputV2 } from '@components/WalletTextInputV2'
import { Text, TouchableOpacity } from 'react-native'
import { ButtonV2 } from '@components/ButtonV2'
import { useDeFiScanContext } from '@shared-contexts/DeFiScanContext'

type Props = StackScreenProps<SettingsParamList, 'AddOrEditAddressBookScreen'>

export function AddOrEditAddressBookScreenV2 ({ route, navigation }: Props): JSX.Element {
  const {
    title,
    onSaveButtonPress,
    address,
    addressLabel,
    isAddNew
  } = route.params
  const [labelInput, setLabelInput] = useState(addressLabel?.label)
  const [addressInput, setAddressInput] = useState<string | undefined>(address)
  const [isEditable, setIsEditable] = useState(isAddNew)
  const { networkName } = useNetworkContext()
  const addressBook = useSelector((state: RootState) => state.userPreferences.addressBook)
  const [labelInputErrorMessage, setLabelInputErrorMessage] = useState('')
  const [addressInputErrorMessage, setAddressInputErrorMessage] = useState('')
  const { fetchWalletAddresses } = useWalletAddress()
  const [walletAddress, setWalletAddress] = useState<string[]>([])
  const { getAddressUrl } = useDeFiScanContext()

  const validateLabelInput = (input: string): boolean => {
    if (input !== undefined && input.trim().length > 40) {
      setLabelInputErrorMessage('Address label is too long (max 40 characters)')
      return false
    }
    if (input.trim() === '') {
      setLabelInputErrorMessage('Please enter an address label')
      return false
    }
    setLabelInputErrorMessage('')
    return true
  }

  const onQrButtonPress = (): void => {
    navigation.navigate({
      name: 'BarCodeScanner',
      params: {
        onQrScanned: (value: string) => {
          setAddressInput(value)
        }
      },
      merge: true
    })
  }

  const validateAddressInput = (input: string): boolean => {
    const decodedAddress = fromAddress(input, networkName)
    if (decodedAddress === undefined) {
      setAddressInputErrorMessage('Please enter a valid address')
      return false
    }
    if ((
      (addressBook?.[input.trim()] !== undefined) &&
        (isAddNew || (!isAddNew && input.trim() !== address))
      ) ||
      walletAddress.includes(input.trim())
    ) {
      // check for unique address when adding new, or only when new address is different from current during edit
      // or when address exists in local address
      setAddressInputErrorMessage('This address already exists in your address book, please enter a different address')
      return false
    }
    setAddressInputErrorMessage('')
    return true
  }

  const isSaveDisabled = (): boolean => {
    if (!isAddNew && address === addressInput && addressLabel?.label === labelInput) {
      return true
    }
    if (addressInput === undefined || labelInput === undefined || labelInputErrorMessage !== '' || addressInputErrorMessage !== '') {
      return true
    }
    return false
  }

  // Passcode prompt
  const dispatch = useAppDispatch()
  const { data: { type: encryptionType } } = useWalletNodeContext()
  const isEncrypted = encryptionType === 'MNEMONIC_ENCRYPTED'
  const logger = useLogger()

  const handleSubmit = useCallback(async (): Promise<void> => {
    if (!isEncrypted ||
      addressInput === undefined ||
      labelInput === undefined ||
      !validateLabelInput(labelInput) ||
      !validateAddressInput(addressInput)) {
      return
    }

    const auth: Authentication<string[]> = {
      consume: async passphrase => await MnemonicStorage.get(passphrase),
      onAuthenticated: async () => {
        const editedAddress = {
          [addressInput]: {
            address: addressInput,
            label: labelInput,
            isMine: false,
            isFavourite: addressLabel?.isFavourite
          }
        }

        if (!isAddNew &&
          address !== undefined &&
          address !== addressInput.trim()
        ) {
          // delete current address if changing to a new address during edit
          dispatch(userPreferences.actions.deleteFromAddressBook(address))
        }
        dispatch(userPreferences.actions.addToAddressBook(editedAddress))
        onSaveButtonPress(addressInput)
        navigation.pop()
      },
      onError: e => logger.error(e),
      title: translate('screens/Settings', 'Add address to address book?\n{{address}}', { address: addressInput }),
      message: translate('screens/Settings', 'Enter passcode to continue'),
      loading: translate('screens/Settings', 'Verifying access')
    }
    dispatch(authentication.actions.prompt(auth))
  }, [navigation, dispatch, isEncrypted, addressInput, labelInput])

  const onDelete = useCallback(async (address: string): Promise<void> => {
    if (!isEncrypted) {
      return
    }
    const auth: Authentication<string[]> = {
      consume: async passphrase => await MnemonicStorage.get(passphrase),
      onAuthenticated: async () => {
        dispatch(userPreferences.actions.deleteFromAddressBook(address))
        navigation.pop()
      },
      onError: e => logger.error(e),
      title: translate('screens/Settings', 'Are you sure you want to delete the address?'),
      message: translate('screens/Settings', 'Enter passcode to continue'),
      loading: translate('screens/Settings', 'Verifying access')
    }
    dispatch(authentication.actions.prompt(auth))
  }, [navigation, dispatch, isEncrypted])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: translate('screens/AddOrEditAddressBookScreen', title)
    })
  }, [navigation])

  useEffect(() => {
    // validate on QR scan
    if (addressInput === undefined) {
      return
    }
    validateAddressInput(addressInput)
  }, [addressInput])

  useEffect(() => {
    let isSubscribed = true
    void fetchWalletAddresses().then((walletAddress) => {
      if (isSubscribed) {
        setWalletAddress(walletAddress)
      }
    })
    return () => {
      isSubscribed = false
    }
  }, [fetchWalletAddresses])

  return (
    <ThemedScrollViewV2
      contentContainerStyle={tailwind('px-5 pb-16')}
      style={tailwind('flex-1')}
    >
      <WalletTextInputV2
        value={addressInput}
        autoCapitalize='none'
        editable={isAddNew}
        multiline
        inputType='default'
        displayClearButton={addressInput !== '' && addressInput !== undefined && isAddNew}
        onChangeText={(text: string) => {
          setAddressInput(text)
          validateAddressInput(text)
        }}
        onClearButtonPress={() => {
          setAddressInput('')
          validateAddressInput('')
        }}
        title={translate('screens/AddOrEditAddressBookScreen', 'ADDRESS')}
        placeholder={translate('screens/AddOrEditAddressBookScreen', 'Enter address')}
        style={tailwind('font-normal-v2 py-2.5 flex-1')}
        valid={addressInputErrorMessage === ''}
        inputContainerStyle={tailwind('px-5')}
        inlineText={{
          type: 'error',
          text: translate('screens/AddOrEditAddressBookScreen', addressInputErrorMessage),
          style: tailwind('px-5')
        }}
        testID='address_book_address_input'
      >
        {(addressInput ?? '')?.trim().length === 0 && (
          <TouchableOpacity
            onPress={onQrButtonPress}
            testID='qr_code_button'
          >
            <ThemedIcon
              light={tailwind('text-mono-light-v2-700')}
              dark={tailwind('text-mono-dark-v2-700')}
              iconType='MaterialIcons'
              name='qr-code'
              size={20}
            />
          </TouchableOpacity>
        )}
        {!isAddNew && addressInput !== undefined && addressInput?.trim().length > 0 && (
          <TouchableOpacity
            onPress={async () => {
                await openURL(getAddressUrl(addressInput))
            }}
            style={tailwind('ml-5')}
          >
            <ThemedIcon
              dark={tailwind('text-mono-dark-v2-700')}
              light={tailwind('text-mono-light-v2-700')}
              iconType='Feather'
              name='external-link'
              size={20}
            />
          </TouchableOpacity>
        )}
      </WalletTextInputV2>
      <WalletTextInputV2
        value={labelInput}
        inputType='default'
        editable={isAddNew || isEditable}
        displayClearButton={labelInput !== '' && labelInput !== undefined && isEditable}
        onChangeText={(text: string) => {
          setLabelInput(text)
          validateLabelInput(text)
        }}
        onClearButtonPress={() => {
          setLabelInput('')
          validateLabelInput('')
        }}
        inputContainerStyle={tailwind('px-5')}
        placeholder={translate('screens/AddOrEditAddressBookScreen', 'Address label')}
        style={tailwind('font-normal-v2 flex-1 py-2.5')}
        title={translate('screens/AddOrEditAddressBookScreen', 'LABEL')}
        valid={labelInputErrorMessage === ''}
        inlineText={{
          type: 'error',
          text: translate('screens/AddOrEditAddressBookScreen', labelInputErrorMessage),
          style: tailwind('px-5')
        }}
        testID='address_book_label_input'
      >
        {!isEditable && (
          <TouchableOpacity
            onPress={() => {
              setIsEditable(true)
          }}
            style={tailwind('ml-5')}
          >
            <ThemedIcon
              dark={tailwind('text-mono-dark-v2-700')}
              light={tailwind('text-mono-light-v2-700')}
              iconType='Feather'
              name='edit-2'
              size={20}
            />
          </TouchableOpacity>
        )}
      </WalletTextInputV2>
      {labelInputErrorMessage === '' && (
        <ThemedTextV2
          style={tailwind('font-normal-v2 text-xs mt-2 px-5')}
          light={tailwind('text-mono-light-v2-500')}
          dark={tailwind('text-mono-dark-v2-500')}
        >
          {translate('screens/AddOrEditAddressBookScreen', 'Maximum of 40 characters.')}
        </ThemedTextV2>
      )}
      {!isEditable && address !== undefined
        ? (
          <>
            <ThemedTouchableOpacityV2
              light={tailwind('bg-mono-light-v2-00')}
              dark={tailwind('bg-mono-dark-v2-00 ')}
              style={tailwind('border-0 p-4.5 flex-row justify-center rounded-lg-v2 mt-6')}
              testID='delete_address'
              onPress={async () => await onDelete(address)}
            >
              <Text
                style={tailwind('font-normal-v2 text-sm text-red-v2')}
              >
                {translate('screens/AddOrEditAddressBookScreen', 'Delete address')}
              </Text>
            </ThemedTouchableOpacityV2>
            <ThemedTextV2
              light={tailwind('text-mono-light-v2-500')}
              dark={tailwind('text-mono-dark-v2-500')}
              style={tailwind('font-normal-v2 mt-2 text-xs text-center')}
            >
              {translate('screens/ServiceProviderScreen', 'This will delete the whitelisted address from your address book.')}
            </ThemedTextV2>
          </>)
      : <ButtonV2
          disabled={isSaveDisabled()}
          label={translate('screens/AddOrEditAddressBookScreen', isAddNew ? 'Save changes' : 'Save address')}
          onPress={handleSubmit}
          testID='save_address_label'
          styleProps='mx-7 mt-12'
        />}
    </ThemedScrollViewV2>
  )
}
