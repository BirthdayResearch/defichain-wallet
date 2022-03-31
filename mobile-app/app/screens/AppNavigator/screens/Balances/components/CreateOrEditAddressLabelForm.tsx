import { memo, useCallback, useState } from 'react'
import { StackScreenProps } from '@react-navigation/stack'
import { BottomSheetWithNavRouteParam } from '@components/BottomSheetWithNav'
import { ThemedScrollView, ThemedText } from '@components/themed'
import { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { Platform, View } from 'react-native'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { RandomAvatar } from './RandomAvatar'
import { WalletTextInput } from '@components/WalletTextInput'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { SubmitButtonGroup } from '@components/SubmitButtonGroup'
import { LabeledAddress, LocalAddress } from '@store/userPreferences'
import { fromAddress } from '@defichain/jellyfish-address'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@store'
import { authentication, Authentication } from '@store/authentication'
import { MnemonicStorage } from '@api/wallet/mnemonic_storage'
import { useWalletNodeContext } from '@shared-contexts/WalletNodeProvider'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'

export interface CreateOrEditAddressLabelFormProps {
  title: string
  isAddressBook: boolean
  address?: string
  addressLabel?: LocalAddress
  index: number
  onSaveButtonPress: (labelAddress: LabeledAddress) => void
}

type Props = StackScreenProps<BottomSheetWithNavRouteParam, 'CreateOrEditAddressLabelFormProps'>

export const CreateOrEditAddressLabelForm = memo(({ route, navigation }: Props): JSX.Element => {
  const { isLight } = useThemeContext()
  const {
    title,
    isAddressBook,
    address,
    addressLabel,
    index,
    onSaveButtonPress
  } = route.params
  const [labelInput, setLabelInput] = useState(addressLabel?.label)
  const [addressInput, setAddressInput] = useState<string | undefined>()
  const bottomSheetComponents = {
    mobile: BottomSheetScrollView,
    web: ThemedScrollView
  }
  const ScrollView = Platform.OS === 'web' ? bottomSheetComponents.web : bottomSheetComponents.mobile
  const { networkName } = useNetworkContext()
  const addressBook = useSelector((state: RootState) => state.userPreferences.addressBook)
  const [labelInputErrorMessage, setLabelInputErrorMessage] = useState('')
  const [addressInputErrorMessage, setAddressInputErrorMessage] = useState('')
  const validateLabelInput = (input: string): boolean => {
    if (input !== undefined && input.trim().length > 30) {
      setLabelInputErrorMessage('Address label is too long (max 30 characters)')
      return false
    }
    if (isAddressBook && input.trim() === '') {
      setLabelInputErrorMessage('Please enter an address label')
      return false
    }
    setLabelInputErrorMessage('')
    return true
  }

  const validateAddressInput = (input: string): boolean => {
    const decodedAddress = fromAddress(input, networkName)
    if (decodedAddress === undefined) {
      setAddressInputErrorMessage('Please enter a valid address')
      return false
    }
    if (addressBook?.[input.trim()] !== undefined) {
      setAddressInputErrorMessage('This address already exists in your address book, please enter a different address')
      return false
    }
    setAddressInputErrorMessage('')
    return true
  }

  const handleSubmit = async (): Promise<void> => {
    if (!isAddressBook) {
      handleEditSubmit()
    } else {
      handleCreateSubmit()
    }
  }

  const handleEditSubmit = (): void => {
    if (labelInput === undefined ||
      address === undefined ||
      !validateLabelInput(labelInput)) {
      return
    }
    onSaveButtonPress({
      [address]: {
        label: labelInput.trim(),
        isMine: true
      }
    })
  }

  // Passcode prompt on create
  const dispatch = useDispatch()
  const { data: { type: encryptionType } } = useWalletNodeContext()
  const isEncrypted = encryptionType === 'MNEMONIC_ENCRYPTED'
  const logger = useLogger()
  const handleCreateSubmit = useCallback(() => {
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
        onSaveButtonPress({
          [addressInput]: {
            label: labelInput.trim(),
            isMine: false
          }
        })
      },
      onError: e => logger.error(e),
      message: translate('screens/Settings', 'Enter passcode to continue'),
      loading: translate('screens/Settings', 'Verifying access')
    }
    dispatch(authentication.actions.prompt(auth))
  }, [dispatch, isEncrypted, addressInput, labelInput, onSaveButtonPress])

  const isSaveDisabled = (): boolean => {
    if (isAddressBook && (addressInput === undefined || labelInput === undefined || labelInputErrorMessage !== '' || addressInputErrorMessage !== '')) {
      return true
    }
    if (!isAddressBook && (labelInput === undefined || labelInput === addressLabel?.label || labelInputErrorMessage !== '')) {
      return true
    }

    return false
  }

  return (
    <ScrollView
      style={tailwind(['p-4 flex-1 pb-0', {
        'bg-white': isLight,
        'bg-gray-800': !isLight
      }])}
      contentContainerStyle={tailwind('pb-6')}
      testID='create_or_edit_label_address_form'
    >
      <View style={tailwind('mb-2 flex-1')}>
        <ThemedText testID='form_title' style={tailwind('flex-1 text-xl font-semibold')}>
          {translate('components/CreateOrEditAddressLabelForm', title)}
        </ThemedText>
      </View>
      {address !== undefined && <AddressDisplay address={address} />}
      <ThemedText
        style={tailwind('text-xs font-medium')}
        light={tailwind('text-gray-400')}
        dark={tailwind('text-gray-500')}
      >
        {translate('components/CreateOrEditAddressLabelForm', 'ADDRESS LABEL')}
      </ThemedText>
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
          isAddressBook ? validateLabelInput('') : setLabelInputErrorMessage('')
        }}
        placeholder={translate('components/CreateOrEditAddressLabelForm', 'Enter address label')}
        style={tailwind('h-9 w-6/12 flex-grow')}
        hasBottomSheet
        valid={labelInputErrorMessage === ''}
        inlineText={{
          type: 'error',
          text: translate('components/CreateOrEditAddressLabelForm', labelInputErrorMessage)
        }}
        testID='address_book_label_input'
      />

      {isAddressBook &&
        (
          <>
            <ThemedText
              style={tailwind('text-xs font-medium mt-4')}
              light={tailwind('text-gray-400')}
              dark={tailwind('text-gray-500')}
            >
              {translate('components/CreateOrEditAddressLabelForm', 'ADDRESS')}
            </ThemedText>
            <AddressInput
              addressInput={addressInput}
              index={index}
              setAddressInput={setAddressInput}
              validateAddressInput={validateAddressInput}
              addressInputErrorMessage={addressInputErrorMessage}
            />
          </>
        )}

      <View style={tailwind('mt-4')}>
        <SubmitButtonGroup
          isDisabled={isSaveDisabled()}
          isCancelDisabled={false}
          label={translate('components/CreateOrEditAddressLabelForm', 'SAVE CHANGES')}
          onCancel={() => navigation.goBack()}
          onSubmit={handleSubmit}
          displayCancelBtn
          title='save_address_label'
        />
      </View>
    </ScrollView>
  )
})

function AddressDisplay ({ address }: { address: string }): JSX.Element {
  return (
    <View style={tailwind('flex flex-row mb-4 items-center')}>
      <RandomAvatar name={address} size={32} />
      <ThemedText
        style={tailwind('text-sm ml-2 flex-1', { 'w-10/12': Platform.OS === 'web' })}
      >
        {address}
      </ThemedText>
    </View>
  )
}

function AddressInput ({
  addressInput,
  index,
  setAddressInput,
  validateAddressInput,
  addressInputErrorMessage
}: { addressInput?: string, index: number, setAddressInput: (val?: string) => void, validateAddressInput: (val: string) => boolean, addressInputErrorMessage: string }): JSX.Element {
  return (
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
      placeholder={translate('components/CreateOrEditAddressLabelForm', 'Enter address')}
      style={tailwind('w-6/12 flex-grow')}
      hasBottomSheet
      valid={addressInputErrorMessage === ''}
      inlineText={{
        type: 'error',
        text: translate('components/CreateOrEditAddressLabelForm', addressInputErrorMessage)
      }}
      testID='address_book_address_input'
    />
  )
}
