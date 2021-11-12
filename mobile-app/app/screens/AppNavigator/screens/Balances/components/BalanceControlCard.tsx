import { tailwind } from '@tailwind'
import { ThemedIcon, ThemedText, ThemedView } from '@components/themed'
import * as React from 'react'
import { useRef, useCallback } from 'react'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { View } from '@components'
import { Platform, TouchableOpacity } from 'react-native'
import { translate } from '@translations'
import { useDeFiScanContext } from '@shared-contexts/DeFiScanContext'
import { openURL } from '@api/linking'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { BalanceParamList } from '@screens/AppNavigator/screens/Balances/BalancesNavigator'
import { IconButton } from '@components/IconButton'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { BottomSheetBackdropProps, BottomSheetBackgroundProps, BottomSheetModal, useBottomSheetModal } from '@gorhom/bottom-sheet'
import { AddressControlModal } from '@screens/AppNavigator/screens/Balances/components/AddressControlScreen'
import { RandomAvatar } from '@screens/AppNavigator/screens/Balances/components/RandomAvatar'

export function BalanceControlCard (): JSX.Element {
  const { addressLength, address } = useWalletContext()
  const { getAddressUrl } = useDeFiScanContext()
  const { isLight } = useThemeContext()
  const { dismiss } = useBottomSheetModal()
  const navigation = useNavigation<NavigationProp<BalanceParamList>>()
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const switchAddressModalName = 'SwitchAddress'

  const onSwitchClick = useCallback(() => {
    if (Platform.OS === 'web') {
      navigation.navigate('AddressControlScreen')
    } else {
      bottomSheetModalRef.current?.present()
    }
  }, [])

  const closeModal = useCallback(() => {
    dismiss(switchAddressModalName)
  }, [])

  const getSnapPoints = (): string[] => {
    if (addressLength > 6) {
      return ['90%']
    }
    if (addressLength > 2) {
      return ['60%']
    }
    return ['30%']
  }

  return (
    <ThemedView
      testID='balance_control_card'
      style={tailwind('p-4 flex flex-col')}
      dark={tailwind('bg-gray-800 border-b border-gray-700')}
      light={tailwind('bg-white border-b border-gray-200')}
    >
      <View style={tailwind('flex flex-row items-center')}>
        <RandomAvatar name={address} size={40} />
        <View
          style={tailwind('flex flex-1 ml-3')}
        >
          <View
            style={tailwind('flex flex-row mb-0.5')}
          >
            <ThemedText
              light={tailwind('text-gray-500')}
              dark={tailwind('text-gray-400')}
              style={tailwind('text-xs mr-1.5')}
            >
              {translate('components/BalanceControlCard', 'Wallet Address')}
            </ThemedText>
            <TouchableOpacity onPress={async () => await openURL(getAddressUrl(address))}>
              <ThemedIcon
                dark={tailwind('text-darkprimary-500')}
                iconType='MaterialIcons'
                light={tailwind('text-primary-500')}
                name='open-in-new'
                size={18}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={async () => await openURL(getAddressUrl(address))}>
            <ThemedText testID='wallet_address' style={tailwind('text-sm font-semibold pr-4')}>
              {address}
            </ThemedText>
          </TouchableOpacity>

        </View>
      </View>
      <View style={tailwind('flex flex-row mt-4')}>
        <IconButton
          iconName='arrow-downward'
          iconSize={20}
          iconType='MaterialIcons'
          onPress={() => navigation.navigate('Receive')}
          testID='receive_balance_button'
          style={tailwind('mr-2')}
          iconLabel={translate('screens/BalancesScreen', 'RECEIVE')}
        />

        <IconButton
          iconName='unfold-more-horizontal'
          iconSize={20}
          iconType='MaterialCommunityIcons'
          onPress={onSwitchClick}
          testID='switch_account_button'
          style={tailwind('mr-2')}
          iconLabel={translate('screens/BalancesScreen', 'SWITCH')}
        />

        {Platform.OS !== 'web' && (
          <BottomSheetModal
            name={switchAddressModalName}
            ref={bottomSheetModalRef}
            snapPoints={getSnapPoints()}
            backdropComponent={(backdropProps: BottomSheetBackdropProps) => (
              <View {...backdropProps} style={[backdropProps.style, tailwind('bg-black bg-opacity-60')]} />
            )}
            backgroundComponent={(backgroundProps: BottomSheetBackgroundProps) => (
              <View
                {...backgroundProps}
                style={[backgroundProps.style, tailwind(`${isLight ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-700'} border-t rounded`)]}
              />
            )}
          >
            <AddressControlModal onClose={closeModal} />
          </BottomSheetModal>
       )}
      </View>
    </ThemedView>
  )
}
