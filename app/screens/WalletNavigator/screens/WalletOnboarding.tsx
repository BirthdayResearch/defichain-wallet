import { useNavigation } from '@react-navigation/native'
import * as React from 'react'
import { ScrollView, TouchableOpacity } from 'react-native'
import { Mnemonic } from '../../../api/wallet/mnemonic'
import { Text, View } from '../../../components'
import { VectorIcon, VectorIconName } from '../../../constants/Theme'
import { useWalletManagementContext } from '../../../contexts/WalletManagementContext'
import { getEnvironment } from '../../../environment'
import { tailwind } from '../../../tailwind'
import { translate } from '../../../translations'

export function WalletOnboarding (): JSX.Element {
  const { setWallet } = useWalletManagementContext()
  const navigator = useNavigation()

  const onDebugPress = getEnvironment().debug ? async () => {
    await setWallet(Mnemonic.createWalletDataAbandon23())
  } : undefined

  return (
    <ScrollView style={tailwind('flex-1 py-8 bg-gray-100')} testID='wallet_onboarding'>
      <View style={tailwind('flex items-center')}>
        <TouchableOpacity delayLongPress={5000} onLongPress={onDebugPress}>
          <View style={tailwind('flex bg-white justify-center items-center rounded-full h-16 w-16')}>
            <VectorIcon size={26} name='account-balance-wallet' color='#999' />
          </View>
        </TouchableOpacity>

        <Text style={tailwind('font-bold text-lg mt-4 text-gray-600')}>
          {translate('screens/WalletOnboarding', 'No wallets')}
        </Text>
      </View>

      <View style={tailwind('mt-8')}>
        <WalletOptionRow
          onPress={() => navigator.navigate('WalletMnemonicCreate')}
          text='Create new mnemonic wallet' icon='account-balance-wallet'
        />
        <View style={tailwind('h-px bg-gray-100')} />
        <WalletOptionRow
          onPress={() => navigator.navigate('WalletMnemonicRestore')}
          text='Restore mnemonic wallet' icon='restore-page'
        />
      </View>
    </ScrollView>
  )
}

function WalletOptionRow (props: { text: string, icon: VectorIconName, onPress: () => void }): JSX.Element {
  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={tailwind('flex-row items-center justify-between px-4 bg-white')}
    >
      <View style={tailwind('flex-row items-center')}>
        <VectorIcon name={props.icon} size={24} style={tailwind('text-primary')} />
        <Text style={tailwind('font-medium ml-3 py-4')}>
          {props.text}
        </Text>
      </View>
      <View>
        <VectorIcon name='chevron-right' size={24} />
      </View>
    </TouchableOpacity>
  )
}
