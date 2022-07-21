import { memo, useCallback, useEffect, useState } from 'react'
import { StackScreenProps } from '@react-navigation/stack'
import { BottomSheetWithNavRouteParam } from '@components/BottomSheetWithNav'
import { ThemedScrollViewV2, ThemedText, ThemedTextV2 } from '@components/themed'
import { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { Platform, View } from 'react-native'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { RandomAvatar } from './RandomAvatar'
import { WalletTextInput } from '@components/WalletTextInput'
import { LabeledAddress, LocalAddress } from '@store/userPreferences'
import { fromAddress } from '@defichain/jellyfish-address'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { authentication, Authentication } from '@store/authentication'
import { MnemonicStorage } from '@api/wallet/mnemonic_storage'
import { useWalletNodeContext } from '@shared-contexts/WalletNodeProvider'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { useAppDispatch } from '@hooks/useAppDispatch'
import { WalletTextInputV2 } from '@components/WalletTextInputV2'
import { SubmitButtonGroupV2 } from '@components/SubmitButtonGroupV2'
import { useThemeContext } from '@shared-contexts/ThemeProvider'

export interface CreateOrEditAddressLabelFormProps {
  title: string
  isAddressBook: boolean
  address?: string
  addressLabel?: LocalAddress
  onSaveButtonPress: (labelAddress: LabeledAddress) => void
}

type Props = StackScreenProps<BottomSheetWithNavRouteParam, 'CreateOrEditAddressLabelFormProps'>

export const CreateOrEditAddressLabelFormV2 = memo(({
  route,
  navigation
}: Props): JSX.Element => {
  // const { isLight } = useThemeContext()
  const {
    title,
    isAddressBook,
    address,
    addressLabel,
    onSaveButtonPress
  } = route.params
  const { isLight } = useThemeContext()
  const [labelInput, setLabelInput] = useState(addressLabel?.label)
  const [addressInput, setAddressInput] = useState<string | undefined>()
  const bottomSheetComponents = {
    mobile: BottomSheetScrollView,
    web: ThemedScrollViewV2
  }
  const ScrollView = Platform.OS === 'web' ? bottomSheetComponents.web : bottomSheetComponents.mobile
  const { networkName } = useNetworkContext()
  const addressBook = useSelector((state: RootState) => state.userPreferences.addressBook)
  const [labelInputErrorMessage, setLabelInputErrorMessage] = useState('')
  const [addressInputErrorMessage, setAddressInputErrorMessage] = useState('')
  const [labelInputLength, setLabelInputLength] = useState(0)

  useEffect(() => {
    if (labelInput !== undefined) {
      setLabelInputLength(labelInput.trim().length)
    }
  }, [labelInput])

  const validateLabelInput = (input: string): boolean => {
    if (input !== undefined) {
      if (input.trim().length > 40) {
        setLabelInputErrorMessage('Invalid label. Maximum of 40 characters.')
        return false
      }

      if (isAddressBook && input.trim() === '') {
        setLabelInputErrorMessage('Please enter an address label')
        return false
      }
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
        address,
        label: labelInput.trim(),
        isMine: true
      }
    })
  }

  // Passcode prompt on create
  const dispatch = useAppDispatch()
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
            address: addressInput,
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
      contentContainerStyle={tailwind('pb-6')}
      testID='create_or_edit_label_address_form'
      style={tailwind('px-4 pt-2 flex-1', {
        'bg-mono-dark-v2-100': !isLight,
        'bg-mono-light-v2-100': isLight
      })}
    >
      <View style={tailwind('flex-1')}>
        <ThemedTextV2 testID='form_title' style={tailwind('flex-1 text-center font-normal-v2 text-xl')}>
          {translate('components/CreateOrEditAddressLabelForm', title)}
        </ThemedTextV2>
      </View>
      {address !== undefined && <AddressDisplay address={address} />}
      <ThemedTextV2
        style={tailwind('font-normal-v2 text-xs mt-4 mb-2')}
        light={tailwind('text-mono-light-v2-500')}
        dark={tailwind('text-mono-dark-v2-500')}
      >
        {translate('components/CreateOrEditAddressLabelForm', 'LABEL')}
      </ThemedTextV2>
      <WalletTextInputV2
        value={labelInput}
        inputType='default'
        displayClearButton={labelInput !== '' && labelInput !== undefined}
        onChangeText={(text: string) => {
          setLabelInput(text)
          validateLabelInput(text)
          setLabelInputLength(text.trim().length)
        }}
        onClearButtonPress={() => {
          setLabelInput('')
          isAddressBook ? validateLabelInput('') : setLabelInputErrorMessage('')
        }}
        placeholder={translate('components/CreateOrEditAddressLabelForm', 'Enter label')}
        style={tailwind('h-9 w-6/12 flex-grow')}
        hasBottomSheet
        valid={labelInputErrorMessage === ''}
        inlineText={{
          type: 'error',
          text: translate('components/CreateOrEditAddressLabelForm', labelInputErrorMessage)
        }}
        testID='address_book_label_input'
      />
      {labelInputErrorMessage === '' && (
        <ThemedTextV2
          style={tailwind('font-normal-v2 text-xs mt-2')}
          light={tailwind('text-mono-light-v2-500')}
          dark={tailwind('text-mono-dark-v2-500')}
        >
          {translate('components/CreateOrEditAddressLabelForm', '{{length}}/40 characters', { length: labelInputLength.toString() })}
        </ThemedTextV2>
      )}

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
              setAddressInput={setAddressInput}
              validateAddressInput={validateAddressInput}
              addressInputErrorMessage={addressInputErrorMessage}
            />
          </>
        )}

      <View style={tailwind('mt-4')}>
        <SubmitButtonGroupV2
          isDisabled={isSaveDisabled()}
          isCancelDisabled={false}
          label={translate('components/CreateOrEditAddressLabelForm', 'Save changes')}
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
    <View style={tailwind('flex flex-col mt-8 items-center')}>
      <RandomAvatar name={address} size={64} />
      <ThemedTextV2
        style={tailwind('mt-2 flex-1 font-normal-v2 text-sm text-center w-3/5', { 'w-10/12': Platform.OS === 'web' })}
      >
        {address}
      </ThemedTextV2>
    </View>
  )
}

function AddressInput ({
  addressInput,
  setAddressInput,
  validateAddressInput,
  addressInputErrorMessage
}: { addressInput?: string, setAddressInput: (val?: string) => void, validateAddressInput: (val: string) => boolean, addressInputErrorMessage: string }): JSX.Element {
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
