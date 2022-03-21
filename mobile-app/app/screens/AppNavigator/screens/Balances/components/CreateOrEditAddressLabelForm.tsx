import { memo, useState } from 'react'
import { StackScreenProps } from '@react-navigation/stack'
import { BottomSheetWithNavRouteParam } from '@components/BottomSheetWithNav'
import { ThemedIcon, ThemedText, ThemedView } from '@components/themed'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { Platform, TouchableOpacity } from 'react-native'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { RandomAvatar } from './RandomAvatar'
import { View } from '@components'
import { WalletTextInput } from '@components/WalletTextInput'
import { useThemeContext } from '@shared-contexts/ThemeProvider'

export interface CreateOrEditAddressLabelFormProps {
  address: string
  addressLabel: string
  type: AddressLabelFormType
  onCloseButtonPress: () => void
  onSubmitButtonPress: () => void
}

type AddressLabelFormType = 'create' | 'edit'
type Props = StackScreenProps<BottomSheetWithNavRouteParam, 'CreateOrEditAddressLabelFormProps'>

export const CreateOrEditAddressLabelForm = memo(({ route }: Props): JSX.Element => {
  const { isLight } = useThemeContext()
  const {
    address,
    addressLabel,
    // type,
    onCloseButtonPress
  } = route.params
  const [labelInput, setLabelInput] = useState(addressLabel)
  const bottomSheetComponents = {
    mobile: BottomSheetView,
    web: ThemedView
  }
  const View = Platform.OS === 'web' ? bottomSheetComponents.web : bottomSheetComponents.mobile

  return (
    <View
      style={tailwind(['p-4 flex-1', {
        'bg-white': isLight,
        'bg-gray-800': !isLight
      }])}
    >
      <View style={tailwind('flex flex-row items-center justify-between mb-2')}>
        <ThemedText testID='form_title' style={tailwind('flex-1 text-xl font-semibold')}>
          {translate('components/CreateOrEditAddressLabelForm', 'EDIT ADDRESS LABEL')}
        </ThemedText>
        {onCloseButtonPress !== undefined && (
          <TouchableOpacity onPress={onCloseButtonPress}>
            <ThemedIcon iconType='MaterialIcons' name='close' size={20} />
          </TouchableOpacity>
        )}
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
        displayClearButton={labelInput !== ''}
        onChangeText={(text: string) => setLabelInput(text)}
        onClearButtonPress={() => {
          setLabelInput('')
        }}
        placeholder={translate('components/AddOrRemoveCollateralForm', `${addressLabel !== '' ? addressLabel : 'Address'}`)}
        style={tailwind('h-9 w-6/12 flex-grow')}
        hasBottomSheet
      />
    </View>
  )
})

function AddressDisplay ({ address }: { address: string }): JSX.Element {
  return (
    <View style={tailwind('flex flex-row mb-4 items-center')}>
      <RandomAvatar name={address} size={32} />
      <ThemedText
        style={tailwind('text-sm ml-2 flex-1')}
      >
        {address}
      </ThemedText>
    </View>
  )
}
