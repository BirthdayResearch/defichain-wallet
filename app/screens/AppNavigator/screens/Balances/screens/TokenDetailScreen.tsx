import { SectionTitle } from '@components/SectionTitle'
import { SummaryTitle } from '@components/SummaryTitle'
import { ThemedIcon, ThemedScrollView, ThemedText, ThemedTouchableOpacity } from '@components/themed'
import { MaterialIcons } from '@expo/vector-icons'
import { useTokensAPI } from '@hooks/wallet/TokensAPI'
import { StackScreenProps } from '@react-navigation/stack'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
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
        amount={new BigNumber(token.amount)}
        suffix={` ${token.symbol}`}
        testID='token_detail_amount'
        title={translate('screens/TokenDetailScreen', 'AMOUNT BALANCE')}
      />

      <SectionTitle
        testID='title_available_options'
        text={translate('screens/TokenDetailScreen', 'AVAILABLE OPTIONS')}
      />

      {
        token.id !== '0' && (
          <>
            <TokenActionRow
              icon='arrow-upward'
              onPress={() => navigation.navigate({
                name: 'Send',
                params: { token },
                merge: true
              })}
              testID='send_button'
              title={translate('screens/TokenDetailScreen', 'Send to other wallet')}
            />

            <TokenActionRow
              icon='arrow-downward'
              onPress={() => navigation.navigate('Receive')}
              testID='receive_button'
              title={`${translate('screens/TokenDetailScreen', 'Receive')} ${token.displaySymbol}`}
            />
          </>
        )
      }

      {
        token.symbol === 'DFI' && (
          <TokenActionRow
            icon='swap-vert'
            onPress={() => {
              const mode: ConversionMode = token.id === '0_utxo' ? 'utxosToAccount' : 'accountToUtxos'
              navigation.navigate({
                name: 'Convert',
                params: { mode },
                merge: true
              })
            }}
            testID='convert_button'
            title={`${translate('screens/TokenDetailScreen', 'Convert to {{symbol}}', { symbol: `${token.id === '0_utxo' ? 'Token' : 'UTXO'}` })}`}
          />
        )
      }
    </ThemedScrollView>
  )
}

function TokenActionRow ({ title, icon, onPress, testID }: TokenActionItems): JSX.Element {
  return (
    <ThemedTouchableOpacity
      onPress={onPress}
      style={tailwind('flex-row py-4 pl-4 pr-2 bg-white border-b border-gray-200')}
      testID={testID}
    >
      <ThemedIcon
        dark={tailwind('text-darkprimary-500')}
        iconType='MaterialIcons'
        light={tailwind('text-primary-500')}
        name={icon}
        size={24}
      />

      <ThemedText style={tailwind('flex-grow ml-2')}>
        {title}
      </ThemedText>

      <ThemedIcon
        iconType='MaterialIcons'
        name='chevron-right'
        size={24}
      />
    </ThemedTouchableOpacity>
  )
}
