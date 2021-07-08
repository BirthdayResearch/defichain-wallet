import { useNavigation } from '@react-navigation/native'
import * as React from 'react'
import { useCallback } from 'react'
import { SectionList, TouchableOpacity } from 'react-native'
import tailwind from 'tailwind-rn'
import { Text, View } from '../../../../components'
import { PrimaryColor, PrimaryColorStyle, VectorIcon } from '../../../../constants/Theme'
import { useNetworkContext } from '../../../../contexts/NetworkContext'
import { useWalletManagementContext } from '../../../../contexts/WalletManagementContext'
import { EnvironmentNetwork, getEnvironment, isPlayground } from '../../../../environment'
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
  const { network, updateNetwork } = useNetworkContext()

  const onPress = useCallback(async () => {
    if (props.network === network) {
      if (isPlayground(props.network)) {
        navigation.navigate('Playground')
      }
    } else {
      await updateNetwork(props.network)
    }
  }, [network])

  return (
    <TouchableOpacity
      style={tailwind('flex-1 flex-row px-4 bg-white items-center justify-between')}
      onPress={onPress}
    >
      <Text style={tailwind('py-4')}>
        {props.network}
      </Text>

      {
        props.network === network ? <VectorIcon size={24} name='check' color={PrimaryColor} /> : null
      }
    </TouchableOpacity>
  )
}

function RowExitWalletItem (): JSX.Element {
  const { clearWallets } = useWalletManagementContext()

  return (
    <TouchableOpacity
      testID='setting_exit_wallet'
      onPress={clearWallets} style={tailwind('bg-white')}
    >
      <Text style={[tailwind('p-4 font-bold'), PrimaryColorStyle.text]}>
        {translate('wallet/settings', 'EXIT WALLET')}
      </Text>
    </TouchableOpacity>
  )
}
