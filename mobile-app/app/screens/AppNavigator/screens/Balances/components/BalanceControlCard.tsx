import { tailwind } from '@tailwind'
import { ThemedIcon, ThemedText, ThemedView } from '@components/themed'
import React from 'react'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { View } from '@components'
import { TouchableOpacity } from 'react-native'
import { translate } from '@translations'
import { useDeFiScanContext } from '@shared-contexts/DeFiScanContext'
import { openURL } from '@api/linking'
// @ts-expect-error
import Avatar from 'react-native-boring-avatars'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { BalanceParamList } from '@screens/AppNavigator/screens/Balances/BalancesNavigator'
import { IconButton } from '@components/IconButton'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { tokensSelector, WalletToken } from '@store/wallet'
import BigNumber from 'bignumber.js'

export function BalanceControlCard (): JSX.Element {
  const { address } = useWalletContext()
  const { getAddressUrl } = useDeFiScanContext()
  const navigation = useNavigation<NavigationProp<BalanceParamList>>()
  const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))

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
      <View style={tailwind('flex flex-row mt-4 -mr-2')}>
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
      </View>
    </ThemedView>
  )
}

function nonZeroBalance (tokens: WalletToken[]): boolean {
  return tokens.some(token => new BigNumber(token.amount).isGreaterThan(0))
}
