import { MaterialIcons } from '@expo/vector-icons'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
import { ScrollView, TouchableOpacity } from 'react-native'
import { Text } from '../../../../../components'
import { ConfirmTitle } from '../../../../../components/ConfirmComponents'
import { SectionTitle } from '../../../../../components/SectionTitle'
import { useTokensAPI } from '../../../../../hooks/wallet/TokensAPI'
import { tailwind } from '../../../../../tailwind'
import { translate } from '../../../../../translations'
import { BalanceParamList } from '../BalancesNavigator'
import { ConversionMode } from './ConvertScreen'

interface TokenActionItems {
  title: string
  icon: React.ComponentProps<typeof MaterialIcons>['name']
  onPress: () => void
  testID: string
}
type Props = StackScreenProps<BalanceParamList, 'TokenDetailScreen'>

export function TokenDetailScreen ({ route, navigation }: Props): JSX.Element {
  const [token, setToken] = useState(route.params.token)
  const tokens = useTokensAPI()

  useEffect(() => {
    const t = tokens.find((t) => t.id === token.id)
    if (t !== undefined) {
      setToken({ ...t })
    }
  }, [JSON.stringify(tokens)])

  return (
    <ScrollView style={tailwind('bg-gray-100')}>
      <ConfirmTitle
        title={translate('screens/TokenDetailScreen', 'AMOUNT BALANCE')}
        amount={new BigNumber(token.amount)} suffix={` ${token.symbol}`} testID='token_detail_amount'
      />
      <SectionTitle
        text={translate('screens/TokenDetailScreen', 'AVAILABLE OPTIONS')}
        testID='title_available_options'
      />
      {
        token.id !== '0' && (
          <>
            <TokenActionRow
              testID='send_button'
              title={translate('screens/TokenDetailScreen', 'Send to other wallet')} icon='arrow-upward'
              onPress={() => navigation.navigate('Send', { token })}
            />
            <TokenActionRow
              testID='receive_button'
              title={`${translate('screens/TokenDetailScreen', 'Receive')} ${token.displaySymbol}`}
              icon='arrow-downward'
              onPress={() => navigation.navigate('Receive')}
            />
          </>
        )
      }
      {
        token.symbol === 'DFI' && (
          <TokenActionRow
            testID='convert_button'
            title={`${translate('screens/TokenDetailScreen', `Convert to ${token.id === '0_utxo' ? 'Token' : 'UTXO'}`)}`}
            icon='swap-vert' onPress={() => {
              const mode: ConversionMode = token.id === '0_utxo' ? 'utxosToAccount' : 'accountToUtxos'
              navigation.navigate('Convert', { mode })
            }}
          />
        )
      }
    </ScrollView>
  )
}

function TokenActionRow ({ title, icon, onPress, testID }: TokenActionItems): JSX.Element {
  return (
    <TouchableOpacity
      testID={testID} onPress={onPress}
      style={tailwind('flex-row py-4 pl-4 pr-2 bg-white border-b border-gray-200')}
    >
      <MaterialIcons name={icon} size={24} style={tailwind('text-primary')} />
      <Text style={tailwind('flex-grow ml-2')}>
        {title}
      </Text>
      <MaterialIcons name='chevron-right' size={24} />
    </TouchableOpacity>
  )
}
