import { tailwind } from '@tailwind'
import { ThemedIcon, ThemedText, ThemedTouchableOpacity, ThemedView, ThemedScrollView } from '@components/themed'
import * as React from 'react'
import { useRef, useCallback } from 'react'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { View } from '@components'
import { Platform, TouchableOpacity } from 'react-native'
import { translate } from '@translations'
import { useDeFiScanContext } from '@shared-contexts/DeFiScanContext'
import { openURL } from '@api/linking'
// @ts-expect-error
import Avatar from 'react-native-boring-avatars'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { BalanceParamList } from '@screens/AppNavigator/screens/Balances/BalancesNavigator'
import { IconButton } from '@components/IconButton'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { BottomSheetBackdropProps, BottomSheetBackgroundProps, BottomSheetModal, useBottomSheetModal } from '@gorhom/bottom-sheet'

export function BalanceControlCard (): JSX.Element {
  const { availableAddresses, address } = useWalletContext()
  const { getAddressUrl } = useDeFiScanContext()
  const { isLight } = useThemeContext()
  const { dismiss } = useBottomSheetModal()
  const navigation = useNavigation<NavigationProp<BalanceParamList>>()
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const switchAddressModalName = 'SwitchAddress'

  const onSwitchClick = useCallback(() => {
    if (Platform.OS === 'web') {
      // WalletAlert(alertInfo)
    } else {
      bottomSheetModalRef.current?.present()
    }
  }, [])

  const closeModal = useCallback(() => {
    dismiss(switchAddressModalName)
  }, [])

  const getSnapPoints = (): string[] => {
    if (availableAddresses.length > 2) {
      return ['50%']
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
        <Avatar
          size={40}
          name={address}
          variant='pixel'
          colors={['#EE2CB1', '#604EBF', '#DB69B8', '#FAEAF5', '#262626']}
        />
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
          <AddressControlCard onClose={closeModal} />
        </BottomSheetModal>
      </View>
    </ThemedView>
  )
}

function AddressControlCard ({ onClose }: { onClose?: () => void }): JSX.Element {
  const { availableAddresses, switchAccount, createAddress } = useWalletContext()

  return (
    <View style={tailwind('w-full pb-16')}>
      <ThemedView
        dark={tailwind('border-b-2 border-gray-700')}
        light={tailwind('border-b-2 border-gray-100')}
        style={tailwind('w-full')}
      >
        <View style={tailwind('flex flex-row justify-between w-full px-4 pb-4 pt-2')}>
          <ThemedText
            dark={tailwind('text-gray-50')}
            light={tailwind('text-gray-900')}
            style={tailwind('ml-2 text-lg font-medium')}
          >
            {translate('components/FeeInfoRow', 'Switch to another wallet')}
          </ThemedText>
          <TouchableOpacity onPress={onClose}>
            <ThemedIcon
              size={24}
              name='close'
              iconType='MaterialIcons'
              dark={tailwind('text-white text-opacity-70')}
              light={tailwind('text-gray-600')}
            />
          </TouchableOpacity>
        </View>
      </ThemedView>
      <ThemedScrollView
        dark={tailwind('text-gray-50')}
        light={tailwind('text-gray-900')}
        contentContainerStyle={tailwind('pb-8')}
      >
        {availableAddresses.map((availableAddress, index) =>
          <AddressItemRow
            key={availableAddress}
            address={availableAddress}
            onPress={async () => {
                await switchAccount(index)
                if (onClose != null) {
                  onClose()
                }
              }}
          />
        )}
        <ThemedTouchableOpacity
          dark={tailwind('bg-gray-800 border-b border-gray-700')}
          light={tailwind('bg-white border-b border-gray-100')}
          style={tailwind('py-4 pl-4 pr-2 flex-row justify-between items-center')}
          onPress={createAddress}
          testID='create_new_address'
        >
          <View style={tailwind('flex-row items-center flex-grow')}>
            <ThemedIcon
              size={16}
              name='add'
              dark={tailwind('text-darkprimary-500')}
              light={tailwind('text-primary-500')}
              style={tailwind('font-normal')}
              iconType='MaterialIcons'
            />

            <View style={tailwind('mx-3 flex-auto')}>
              <ThemedText
                dark={tailwind('text-darkprimary-500')}
                light={tailwind('text-primary-500')}
                style={tailwind('text-sm font-normal')}
              >
                {translate('components/FeeInfoRow', 'CREATE WALLET ADDRESS')}
              </ThemedText>
            </View>
          </View>
        </ThemedTouchableOpacity>
      </ThemedScrollView>
    </View>
  )
}

function AddressItemRow ({ address, onPress }: { address: string, onPress: () => void }): JSX.Element {
  return (
    <ThemedTouchableOpacity
      dark={tailwind('bg-gray-800 border-b border-gray-700')}
      light={tailwind('bg-white border-b border-gray-100')}
      onPress={onPress}
      style={tailwind('py-4 pl-4 pr-2 flex-row justify-between items-center')}
      testID={`address_row_${address}`}
    >
      <View style={tailwind('flex-row items-center flex-grow')}>
        <ThemedIcon
          size={16}
          name='account-balance-wallet'
          iconType='MaterialIcons'
          dark={tailwind('text-white text-opacity-70')}
          light={tailwind('text-gray-600')}
        />

        <View style={tailwind('mx-3 flex-auto')}>
          <ThemedText
            dark={tailwind('text-gray-200')}
            light={tailwind('text-black')}
            style={tailwind('text-sm font-normal')}
          >
            {address}
          </ThemedText>
        </View>
        <View style={tailwind('flex-row items-center')}>
          <ThemedIcon
            dark={tailwind('text-gray-200')}
            iconType='MaterialIcons'
            light={tailwind('text-black')}
            name='chevron-right'
            size={24}
          />
        </View>
      </View>
    </ThemedTouchableOpacity>
  )
}
