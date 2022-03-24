import { memo, useState } from 'react'
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

export interface CreateOrEditAddressLabelFormProps {
  address: string
  addressLabel?: LocalAddress
  index: number
  type: AddressLabelFormType // currently only `edit`
  onSubmitButtonPress: (labelAddress: LabeledAddress) => Promise<void>
}

type AddressLabelFormType = 'create' | 'edit'
type Props = StackScreenProps<BottomSheetWithNavRouteParam, 'CreateOrEditAddressLabelFormProps'>

export const CreateOrEditAddressLabelForm = memo(({ route, navigation }: Props): JSX.Element => {
  const { isLight } = useThemeContext()
  const {
    address,
    addressLabel,
    // type,
    index,
    onSubmitButtonPress
  } = route.params
  const [labelInput, setLabelInput] = useState(addressLabel?.label)
  const bottomSheetComponents = {
    mobile: BottomSheetScrollView,
    web: ThemedScrollView
  }
  const ScrollView = Platform.OS === 'web' ? bottomSheetComponents.web : bottomSheetComponents.mobile

  const [inputErrorMessage, setInputErrorMessage] = useState('')
  const validateInput = (input: string): boolean => {
    if (input !== undefined && input.length > 30) {
      setInputErrorMessage('Address label is too long (max 30 characters)')
      return false
    }
    setInputErrorMessage('')
    return true
  }
  const handleSubmit = async (): Promise<void> => {
    if (labelInput === undefined) {
      return
    }

    if (!validateInput(labelInput)) {
      return
    }

    await onSubmitButtonPress({
      [address]: {
        label: labelInput,
        isMine: true
      }
    })
  }

  return (
    <ScrollView
      style={tailwind(['p-4 flex-1 pb-0', {
        'bg-white': isLight,
        'bg-gray-800': !isLight
      }])}
    >
      <View style={tailwind('mb-2 flex-1')}>
        <ThemedText testID='form_title' style={tailwind('flex-1 text-xl font-semibold')}>
          {translate('components/CreateOrEditAddressLabelForm', 'EDIT ADDRESS LABEL')}
        </ThemedText>
      </View>
      <AddressDisplay address={address} />
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
          validateInput(text)
        }}
        onClearButtonPress={() => {
          setLabelInput('')
          setInputErrorMessage('')
        }}
        placeholder={translate('components/CreateOrEditAddressLabelForm', `${typeof labelInput === 'string' ? labelInput : 'Address {{index}}'}`, { index })}
        style={tailwind('h-9 w-6/12 flex-grow')}
        hasBottomSheet
        valid={inputErrorMessage === ''}
        inlineText={{
          type: 'error',
          text: translate('components/CreateOrEditAddressLabelForm', inputErrorMessage)
        }}
      />
      <View style={tailwind('mt-4')}>
        <SubmitButtonGroup
          isDisabled={labelInput === addressLabel?.label || labelInput === undefined || inputErrorMessage !== ''}
          isCancelDisabled={false}
          label={translate('components/CreateOrEditAddressLabelForm', 'SAVE CHANGES')}
          onCancel={() => navigation.goBack()}
          onSubmit={handleSubmit}
          displayCancelBtn
          title='edit_address_label'
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
