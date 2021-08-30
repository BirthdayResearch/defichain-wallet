import { MaterialIcons } from '@expo/vector-icons'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
import { SectionTitle } from '../../../../../components/SectionTitle'
import { SummaryTitle } from '../../../../../components/SummaryTitle'
import { ThemedIcon, ThemedScrollView, ThemedText, ThemedTouchableOpacity } from '../../../../../components/themed'
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
    <ThemedScrollView>
      <SummaryTitle
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
              onPress={() => navigation.navigate({ name: 'Send', params: { token }, merge: true })}
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
            title={`${translate('screens/TokenDetailScreen', 'Convert to {{symbol}}', { symbol: `${token.id === '0_utxo' ? 'Token' : 'UTXO'}` })}`}
            icon='swap-vert' onPress={() => {
              const mode: ConversionMode = token.id === '0_utxo' ? 'utxosToAccount' : 'accountToUtxos'
              navigation.navigate({ name: 'Convert', params: { mode }, merge: true })
            }}
          />
        )
      }
    </ThemedScrollView>
  )
}

function TokenActionRow ({ title, icon, onPress, testID }: TokenActionItems): JSX.Element {
  return (
    <ThemedTouchableOpacity
      testID={testID} onPress={onPress}
      style={tailwind('flex-row py-4 pl-4 pr-2 bg-white border-b border-gray-200')}
    >
      <ThemedIcon
        iconType='MaterialIcons' name={icon} size={24} light={tailwind('text-primary-500')}
        dark={tailwind('text-darkprimary-500')}
      />
      <ThemedText style={tailwind('flex-grow ml-2')}>
        {title}
      </ThemedText>
      <ThemedIcon iconType='MaterialIcons' name='chevron-right' size={24} />
    </ThemedTouchableOpacity>
  )
}
