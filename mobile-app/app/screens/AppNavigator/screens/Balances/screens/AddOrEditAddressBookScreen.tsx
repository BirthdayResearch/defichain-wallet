import { MnemonicStorage } from '@api/wallet/mnemonic_storage'
import { View } from '@components'
import { HeaderTitle } from '@components/HeaderTitle'
import { SubmitButtonGroup } from '@components/SubmitButtonGroup'
import { ThemedIcon, ThemedText, ThemedTouchableOpacity, ThemedView } from '@components/themed'
import { WalletTextInput } from '@components/WalletTextInput'
import { fromAddress } from '@defichain/jellyfish-address'
import { StackScreenProps } from '@react-navigation/stack'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { useWalletNodeContext } from '@shared-contexts/WalletNodeProvider'
import { RootState } from '@store'
import { authentication, Authentication } from '@store/authentication'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BalanceParamList } from '../BalancesNavigator'

type Props = StackScreenProps<BalanceParamList, 'AddOrEditAddressBookScreen'>

export function AddOrEditAddressBookScreen ({ route, navigation }: Props): JSX.Element {
  const {
    title,
    onSaveButtonPress,
    address,
    addressLabel,
    isAddNew
  } = route.params
  const [labelInput, setLabelInput] = useState(addressLabel?.label)
  const [addressInput, setAddressInput] = useState<string | undefined>(address)
  const { networkName } = useNetworkContext()
  const addressBook = useSelector((state: RootState) => state.userPreferences.addressBook)
  const [labelInputErrorMessage, setLabelInputErrorMessage] = useState('')
  const [addressInputErrorMessage, setAddressInputErrorMessage] = useState('')

  const validateLabelInput = (input: string): boolean => {
    if (input !== undefined && input.trim().length > 30) {
      setLabelInputErrorMessage('Address label is too long (max 30 characters)')
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
        onQrScanned: (value) => {
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
    if (addressBook?.[input.trim()] !== undefined && (isAddNew || (!isAddNew && input.trim() !== address))) {
      // check for unique address when adding new, or only when new address is different from current during edit
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
  const dispatch = useDispatch()
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
        const _addressBook = {
          ...addressBook,
          [addressInput]: {
            label: labelInput,
            isMine: false
          }
        }

        if (!isAddNew &&
          address !== undefined &&
          address !== addressInput.trim()
        ) {
          // delete current address if changing to a new address during edit
          const { [address]: _, ...newAddressBook } = _addressBook
          onSaveButtonPress(newAddressBook)
        } else {
          onSaveButtonPress(_addressBook)
        }
        navigation.pop()
      },
      onError: e => logger.error(e),
      title: translate('screens/Settings', 'Sign to save address'),
      message: translate('screens/Settings', 'Enter passcode to continue'),
      loading: translate('screens/Settings', 'Verifying access')
    }
    dispatch(authentication.actions.prompt(auth))
  }, [navigation, dispatch, isEncrypted, addressInput, labelInput, onSaveButtonPress, addressBook])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <HeaderTitle
          text={translate('screens/AddOrEditAddressBookScreen', title)}
        />
      )
    })
  }, [navigation])

  useEffect(() => {
    // validate on QR scan
    if (addressInput === undefined) {
      return
    }
    validateAddressInput(addressInput)
  }, [addressInput])

  return (
    <ThemedView style={tailwind('p-4 pt-6 flex-1')}>
      <ThemedText
        style={tailwind('text-xl font-semibold')}
      >
        {translate('screens/AddOrEditAddressBookScreen', title)}
      </ThemedText>

      <View style={tailwind('mb-6 mt-4')}>
        <WalletTextInput
          value={labelInput}
          inputType='default'
          displayClearButton={labelInput !== '' && labelInput !== undefined}
          onChangeText={(text: string) => {
            setLabelInput(text)
            validateLabelInput(text)
          }}
          onClearButtonPress={() => {
            setLabelInput('')
            validateLabelInput('')
          }}
          placeholder={translate('screens/AddOrEditAddressBookScreen', 'Enter address label')}
          style={tailwind('h-9 w-6/12 flex-grow')}
          valid={labelInputErrorMessage === ''}
          inlineText={{
            type: 'error',
            text: translate('screens/AddOrEditAddressBookScreen', labelInputErrorMessage)
          }}
          title={translate('screens/AddOrEditAddressBookScreen', 'Address label')}
          testID='address_book_label_input'
        />
      </View>

      <WalletTextInput
        value={addressInput}
        autoCapitalize='none'
        multiline
        inputType='default'
        displayClearButton={addressInput !== '' && addressInput !== undefined}
        onChangeText={(text: string) => {
          setAddressInput(text)
          validateAddressInput(text)
        }}
        onClearButtonPress={() => {
          setAddressInput('')
          validateAddressInput('')
        }}
        placeholder={translate('screens/AddOrEditAddressBookScreen', 'Enter address')}
        style={tailwind('w-6/12 flex-grow')}
        valid={addressInputErrorMessage === ''}
        inlineText={{
          type: 'error',
          text: translate('screens/AddOrEditAddressBookScreen', addressInputErrorMessage)
        }}
        title={translate('screens/AddOrEditAddressBookScreen', 'Address')}
        testID='address_book_address_input'
      >
        <ThemedTouchableOpacity
          dark={tailwind('bg-gray-800 border-gray-400')}
          light={tailwind('bg-white border-gray-300')}
          onPress={onQrButtonPress}
          style={tailwind('w-9 p-1.5 border rounded')}
          testID='qr_code_button'
        >
          <ThemedIcon
            dark={tailwind('text-darkprimary-500')}
            iconType='MaterialIcons'
            light={tailwind('text-primary-500')}
            name='qr-code-scanner'
            size={24}
          />
        </ThemedTouchableOpacity>
      </WalletTextInput>

      <View style={tailwind('mt-4')}>
        <SubmitButtonGroup
          isDisabled={isSaveDisabled()}
          isCancelDisabled={false}
          label={translate('screens/AddOrEditAddressBookScreen', 'SAVE CHANGES')}
          onCancel={() => navigation.goBack()}
          onSubmit={handleSubmit}
          displayCancelBtn
          title='save_address_label'
        />
      </View>
    </ThemedView>
  )
}
