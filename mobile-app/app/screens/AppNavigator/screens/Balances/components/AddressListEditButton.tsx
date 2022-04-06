import { ThemedIcon, ThemedText } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { TouchableOpacity } from 'react-native'

export function AddressListEditButton ({
  isEditing,
  handleOnPress
}: { isEditing: boolean, handleOnPress: () => void }): JSX.Element {
  return (
    <TouchableOpacity
      onPress={handleOnPress}
      style={tailwind('flex flex-row items-center')}
      testID='address_list_edit_button'
    >
      <ThemedIcon
        iconType='MaterialIcons'
        light={tailwind('text-primary-500')}
        dark={tailwind('text-darkprimary-500')}
        name={isEditing ? 'close' : 'drive-file-rename-outline'}
        size={16}
      />
      <ThemedText
        light={tailwind('text-primary-500')}
        dark={tailwind('text-darkprimary-500')}
        style={tailwind('text-2xs ml-1.5')}
      >
        {translate('components/BottomSheetAddressDetail', `${isEditing ? 'CANCEL' : 'EDIT'}`)}
      </ThemedText>
    </TouchableOpacity>

  )
}
