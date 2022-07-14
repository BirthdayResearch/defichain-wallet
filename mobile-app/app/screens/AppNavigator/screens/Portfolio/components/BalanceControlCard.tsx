import { tailwind } from '@tailwind'
import { ThemedIcon, ThemedText, ThemedView } from '@components/themed'
import { useRef, useCallback } from 'react'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { View } from '@components'
import { Platform, TouchableOpacity } from 'react-native'
import { translate } from '@translations'
import { useDeFiScanContext } from '@shared-contexts/DeFiScanContext'
import { openURL } from '@api/linking'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { PortfolioParamList } from '@screens/AppNavigator/screens/Portfolio/PortfolioNavigator'
import { IconButton } from '@components/IconButton'
import { DfxButtons } from './DfxButtons'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { BottomSheetBackdropProps, BottomSheetBackgroundProps, BottomSheetModal, useBottomSheetModal } from '@gorhom/bottom-sheet'
import { AddressControlModal } from '@screens/AppNavigator/screens/Portfolio/components/AddressControlScreen'
import { RandomAvatar } from '@screens/AppNavigator/screens/Portfolio/components/RandomAvatar'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { tokensSelector, WalletToken } from '@store/wallet'
import BigNumber from 'bignumber.js'

export function BalanceControlCard (): JSX.Element {
  const { addressLength, address } = useWalletContext()
  const { getAddressUrl } = useDeFiScanContext()
  const { isLight } = useThemeContext()
  const { dismiss } = useBottomSheetModal()
  const navigation = useNavigation<NavigationProp<PortfolioParamList>>()
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
    if (addressLength > 5) {
      return ['80%']
    }
    if (addressLength > 2) {
      return ['60%']
    }
    return ['40%']
  }
  const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))

  return (
    <ThemedView
      testID='balance_control_card'
      style={tailwind('p-4 pb-2 flex flex-col')}
      dark={tailwind('bg-dfxblue-800 border-b border-dfxblue-900')}
      light={tailwind('bg-white border-b border-gray-200')}
    >
      <View style={tailwind('flex flex-row items-center')}>
        <View>
          <RandomAvatar name={address} size={40} />
          {addressLength > 0 && (
            <ThemedView
              light={tailwind('bg-primary-700 border-white')}
              dark={tailwind('bg-dfxred-500 border-dfxblue-900')}
              style={tailwind('absolute rounded-full h-6 w-6 border bottom-0 -top-1 flex justify-center items-center -right-1')}
            >
              <ThemedText
                testID='address_count_badge'
                light={tailwind('text-white text-opacity-90')}
                dark={tailwind('text-white text-opacity-90')}
                style={tailwind('text-xs text-center')}
              >
                {addressLength > 9 ? '9+' : addressLength + 1}
              </ThemedText>
            </ThemedView>
          )}
        </View>
        <View
          style={tailwind('flex flex-1 ml-3')}
        >
          <View
            style={tailwind('flex flex-row mb-0.5')}
          >
            <ThemedText
              light={tailwind('text-dfxgray-500')}
              dark={tailwind('text-dfxgray-400')}
              style={tailwind('text-xs mr-1.5')}
            >
              {translate('components/BalanceControlCard', 'Wallet Address')}
            </ThemedText>
            <TouchableOpacity onPress={async () => await openURL(getAddressUrl(address))}>
              <ThemedIcon
                dark={tailwind('text-dfxred-500')}
                iconType='MaterialIcons'
                light={tailwind('text-primary-500')}
                name='open-in-new'
                size={18}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={async () => await openURL(getAddressUrl(address))}>
            <ThemedText
              testID='wallet_address'
              style={tailwind('text-sm font-semibold pr-4')}
              numberOfLines={1}
              ellipsizeMode='middle'
            >
              {address}
            </ThemedText>
          </TouchableOpacity>

        </View>
      </View>
      <View style={tailwind('flex flex-row justify-between mt-4 -mr-2')}>
        <IconButton
          iconName='unfold-more-horizontal'
          iconSize={20}
          iconType='MaterialCommunityIcons'
          onPress={onSwitchClick}
          testID='switch_account_button'
          style={tailwind('mr-2')}
          iconLabel={translate('screens/BalancesScreen', 'SWITCH')}
        />

        <IconButton
          iconName='arrow-upward'
          iconSize={20}
          iconType='MaterialIcons'
          onPress={() => navigation.navigate('Send')}
          testID='send_balance_button'
          style={tailwind('mr-2')}
          iconLabel={translate('screens/BalancesScreen', 'SEND')}
          disabled={!nonZeroBalance(tokens)}
        />
        <IconButton
          iconName='arrow-downward'
          iconSize={20}
          iconType='MaterialIcons'
          onPress={() => navigation.navigate('Receive')}
          testID='receive_balance_button'
          style={tailwind('mr-2')}
          iconLabel={translate('screens/BalancesScreen', 'RECEIVE')}
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
                style={[backgroundProps.style, tailwind(`${isLight ? 'bg-white border-gray-200' : 'bg-dfxblue-800 border-dfxblue-900'} border-t rounded`)]}
              />
            )}
          >
            <AddressControlModal onClose={closeModal} />
          </BottomSheetModal>
        )}
      </View>
      <DfxButtons />
    </ThemedView>
  )
}

function nonZeroBalance (tokens: WalletToken[]): boolean {
  return tokens.some(token => new BigNumber(token.amount).isGreaterThan(0))
}
