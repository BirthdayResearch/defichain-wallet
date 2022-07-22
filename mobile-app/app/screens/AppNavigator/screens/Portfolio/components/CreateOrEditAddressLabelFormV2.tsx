import { memo, useEffect, useState } from 'react'
import { StackScreenProps } from '@react-navigation/stack'
import { BottomSheetWithNavRouteParam } from '@components/BottomSheetWithNavV2'
import { ThemedScrollViewV2, ThemedTextV2 } from '@components/themed'
import { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { Platform, View } from 'react-native'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { RandomAvatar } from './RandomAvatar'
import { LabeledAddress, LocalAddress } from '@store/userPreferences'
import { WalletTextInputV2 } from '@components/WalletTextInputV2'
import { SubmitButtonGroupV2 } from '@components/SubmitButtonGroupV2'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { useToast } from 'react-native-toast-notifications'

export interface CreateOrEditAddressLabelFormProps {
  title: string
  address?: string
  addressLabel?: LocalAddress
  isCreateNewWallet: boolean
  onSaveButtonPress: (labelAddress: LabeledAddress) => void
  onCloseButtonPress: () => void
}

type Props = StackScreenProps<BottomSheetWithNavRouteParam, 'CreateOrEditAddressLabelFormProps'>

export const CreateOrEditAddressLabelFormV2 = memo(({
  route,
  navigation
}: Props): JSX.Element => {
  const {
    title,
    address,
    addressLabel,
    isCreateNewWallet,
    onSaveButtonPress,
    onCloseButtonPress
  } = route.params
  const { isLight } = useThemeContext()
  const [labelInput, setLabelInput] = useState(addressLabel?.label)
  const bottomSheetComponents = {
    mobile: BottomSheetScrollView,
    web: ThemedScrollViewV2
  }
  const ScrollView = Platform.OS === 'web' ? bottomSheetComponents.web : bottomSheetComponents.mobile
  const [labelInputErrorMessage, setLabelInputErrorMessage] = useState('')
  const [labelInputLength, setLabelInputLength] = useState(0)
  const toast = useToast()
  const TOAST_DURATION = 2000

  useEffect(() => {
    if (isCreateNewWallet) {
      toast.show(translate('components/toaster', 'Wallet created'), {
        type: 'wallet_toast',
        placement: 'top',
        duration: TOAST_DURATION
      })
    }
  }, [])

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
    }

    setLabelInputErrorMessage('')
    return true
  }

  const handleEditSubmit = async (): Promise<void> => {
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

  const isSaveDisabled = (): boolean => {
    return labelInput === undefined || labelInput === addressLabel?.label || labelInputErrorMessage !== ''
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
        style={tailwind('font-normal-v2 text-xs mt-4 mb-2 ml-5')}
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
          setLabelInputErrorMessage('')
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
          style={tailwind('font-normal-v2 text-xs mt-2 ml-5')}
          light={tailwind('text-mono-light-v2-500')}
          dark={tailwind('text-mono-dark-v2-500')}
        >
          {translate('components/CreateOrEditAddressLabelForm', '{{length}}/40 characters', { length: labelInputLength.toString() })}
        </ThemedTextV2>
      )}

      <View style={tailwind('mt-4')}>
        <SubmitButtonGroupV2
          isDisabled={isSaveDisabled()}
          isCancelDisabled={false}
          label={translate('components/CreateOrEditAddressLabelForm', isCreateNewWallet ? 'Save label' : 'Save changes')}
          cancelLabel={isCreateNewWallet ? 'Skip' : ''}
          onCancel={() => isCreateNewWallet ? onCloseButtonPress() : navigation.goBack()}
          onSubmit={handleEditSubmit}
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
