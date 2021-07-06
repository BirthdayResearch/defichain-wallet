import { useNavigation } from '@react-navigation/native'
import * as React from 'react'
import { useCallback } from 'react'
import { SectionList, TouchableOpacity } from 'react-native'
import { useDispatch } from 'react-redux'
import tailwind from 'tailwind-rn'
import { EnvironmentNetwork, getEnvironment, isPlayground } from '../../../../app/environment'
import { setNetwork } from '../../../../app/storage'
import { Text, View } from '../../../../components'
import { PrimaryColor, PrimaryColorStyle, VectorIcon } from '../../../../constants/Theme'
import { useWalletAPI } from '../../../../hooks/wallet/WalletAPI'
import { translate } from '../../../../translations'

export function SettingsScreen (): JSX.Element {
  const networks = getEnvironment().networks

  return (
    <View style={tailwind('flex-1 bg-gray-100')}>
      <SectionList
        sections={[
          {
            key: 'Network',
            data: networks,
            renderItem: ({ item }) => <RowNetworkItem network={item as EnvironmentNetwork} />
          },
          {
            data: ['EXIT WALLET'],
            renderItem: () => <RowExitWalletItem />
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
    return <Text style={tailwind('h-6')} />
  }

  return (
    <Text style={tailwind('p-4 font-bold text-lg')}>
      {translate('wallet/settings', key)}
    </Text>
  )
}

function RowNetworkItem (props: { network: EnvironmentNetwork }): JSX.Element {
  const navigation = useNavigation()

  const onPress = useCallback(async () => {
    await setNetwork(props.network)
    // TODO(fuxingloh): reset wallet via store
    if (isPlayground(props.network)) {
      navigation.navigate('Playground')
    }
  }, [])

  return (
    <TouchableOpacity
      style={tailwind('flex-1 flex-row px-4 bg-white items-center justify-between')}
      onPress={onPress}
    >
      <Text style={tailwind('py-4')}>
        {props.network}
      </Text>
      <VectorIcon size={24} name='check' color={PrimaryColor} />
    </TouchableOpacity>
  )
}

function RowExitWalletItem (): JSX.Element {
  const WalletAPI = useWalletAPI()
  const dispatch = useDispatch()

  const onExit = useCallback(() => {
    WalletAPI.clearWallet(dispatch)
  }, [])

  return (
    <TouchableOpacity
      testID='setting_exit_wallet'
      onPress={onExit} style={tailwind('bg-white')}
    >
      <Text style={[tailwind('p-4 font-bold'), PrimaryColorStyle.text]}>
        {translate('wallet/settings', 'EXIT WALLET')}
      </Text>
    </TouchableOpacity>
  )
}
