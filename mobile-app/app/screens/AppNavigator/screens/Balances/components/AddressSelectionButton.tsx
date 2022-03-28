import { ThemedText, ThemedTouchableOpacity, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { Platform } from 'react-native'
import { RandomAvatar } from './RandomAvatar'
import { useAddressLabel } from '@hooks/useAddressLabel'

interface AddressSelectionButtonProps {
  address: string
  addressLength: number
  onPress?: () => void
  hasCount?: boolean
}

export function AddressSelectionButton (props: AddressSelectionButtonProps): JSX.Element {
  const addressLabel = useAddressLabel(props.address)
  return (
    <ThemedTouchableOpacity
      light={tailwind('bg-gray-50')}
      dark={tailwind('bg-gray-900')}
      style={tailwind('rounded-2xl p-1 pr-2 flex flex-row items-center')}
      onPress={props.onPress}
      testID='switch_account_button'
    >
      <RandomAvatar name={props.address} size={24} />
      <ThemedText
        ellipsizeMode='middle'
        numberOfLines={1}
        style={[tailwind('text-xs ml-1'), { minWidth: 10, maxWidth: 56 }]}
        light={tailwind('text-black')}
        dark={tailwind('text-white')}
        testID='wallet_address'
      >
        {addressLabel != null ? addressLabel : props.address}
      </ThemedText>
      {props.addressLength > 0 && props.hasCount &&
        (
          <ThemedView
            light={tailwind('bg-warning-600')}
            dark={tailwind('bg-darkwarning-600')}
            style={tailwind('rounded-full w-4 h-4 ml-1')}
          >
            <ThemedText
              light={tailwind('text-white')}
              dark={tailwind('text-black')}
              style={tailwind('text-2xs h-4 font-medium text-center leading-4', { 'relative top-0.5 leading-3': Platform.OS === 'android' })}
              testID='address_count_badge'
            >
              {props.addressLength > 9 ? '9+' : props.addressLength + 1}
            </ThemedText>
          </ThemedView>
        )}
    </ThemedTouchableOpacity>
  )
}
