import * as React from 'react'
import tailwind from 'tailwind-rn'
import { useDispatch, useSelector } from 'react-redux'
import { Text, View, SectionList, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { translate } from '../../../../translations'
import { PrimaryColor, PrimaryColorStyle } from '../../../../constants/Theme'
import { useWalletAPI } from '../../../../hooks/wallet/WalletAPI'
import { RootState } from '../../../../store'
import { NetworkName } from '../../../../store/network'

export function SettingsScreen (): JSX.Element {
  const network = useSelector<RootState, NetworkName | undefined>(state => state.network.name)
  const WalletAPI = useWalletAPI()
  const dispatch = useDispatch()

  return (
    <View style={tailwind('flex-1 bg-gray-100')}>
      <SectionList
        sections={[
          {
            key: 'Network',
            data: [''],
            renderItem (): JSX.Element {
              return RowNetworkItem(network)
            }
          },
          {
            data: ['EXIT WALLET'],
            renderItem ({ item }): JSX.Element {
              return RowExitWalletItem(() => WalletAPI.clearWallet(dispatch))
            }
          }
        ]}
        ItemSeparatorComponent={ItemSeparator}
        renderSectionHeader={({ section }) => {
          return SectionHeader(section.key)
        }}
        keyExtractor={(item, index) => `${index}`}
      />
    </View>
  )
}

function ItemSeparator (): JSX.Element {
  return <View style={tailwind('h-px bg-gray-100')} />
}

function SectionHeader (key?: string): JSX.Element | null {
  if (key === undefined) {
    return <Text style={tailwind('h-5')} />
  }

  return (
    <Text style={tailwind('p-4 font-bold')}>
      {translate('wallet/settings', key)}
    </Text>
  )
}

function RowNetworkItem (network?: NetworkName): JSX.Element {
  function getNetworkName (): string {
    switch (network) {
      case 'mainnet':
        return 'MainNet'
      case 'testnet':
        return 'TestNet'
      case 'regtest':
        return 'RegTest'
      case 'playground':
        return 'Playground'
      default:
        return 'Not Connected'
    }
  }

  return (
    <TouchableOpacity style={tailwind('flex-1 flex-row px-4 bg-white items-center justify-between')}>
      <Text style={tailwind('py-4')}>
        {getNetworkName()}
      </Text>
      <Ionicons size={20} name='checkmark-sharp' color={PrimaryColor} />
    </TouchableOpacity>
  )
}

function RowExitWalletItem (onPress: () => void): JSX.Element {
  return (
    <TouchableOpacity
      testID='setting_exit_wallet'
      onPress={onPress} style={tailwind('bg-white')}
    >
      <Text style={[tailwind('p-4 font-bold'), PrimaryColorStyle.text]}>
        {translate('wallet/settings', 'EXIT WALLET')}
      </Text>
    </TouchableOpacity>
  )
}
