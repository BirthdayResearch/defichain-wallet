import { View } from '@components/'
import { IconButton } from '@components/IconButton'
import { getNativeIcon } from '@components/icons/assets'
import {
  ThemedScrollView,
  ThemedText,
  ThemedView
} from '@components/themed'
import { useTokensAPI } from '@hooks/wallet/TokensAPI'
import { StackScreenProps } from '@react-navigation/stack'
import { WalletToken } from '@store/wallet'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
import NumberFormat from 'react-number-format'
import { BalanceParamList } from '../BalancesNavigator'
import { ConversionMode } from './ConvertScreen'

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
      <TokenSummary token={token} />
      <ThemedView
        light={tailwind('bg-white border-gray-200')}
        dark={tailwind('bg-black border-gray-700')}
        style={tailwind('flex-row flex-wrap px-4 pb-6 border-b')}
      >
        {
          token.id !== '0' && (
            <>
              <IconButton
                iconName='arrow-upward'
                iconType='MaterialIcons'
                iconSize={16}
                iconLabel={translate('screens/TokenDetailScreen', 'SEND')}
                style={tailwind('mr-2 p-2')}
                onPress={() => navigation.navigate({
                  name: 'Send',
                  params: { token },
                  merge: true
                })}
                testID='send_button'
                disabled={new BigNumber(token.amount).isZero()}
              />
              <IconButton
                iconName='arrow-downward'
                iconType='MaterialIcons'
                iconSize={16}
                iconLabel={translate('screens/TokenDetailScreen', 'RECEIVE')}
                style={tailwind('mr-2 p-2')}
                onPress={() => navigation.navigate('Receive')}
                testID='receive_button'
              />
            </>
          )
        }
        {
          token.symbol === 'DFI' && (
            <IconButton
              iconName='swap-vert'
              iconType='MaterialIcons'
              iconSize={16}
              iconLabel={translate('screens/TokenDetailScreen', 'CONVERT')}
              style={tailwind('p-2')}
              onPress={() => {
                const mode: ConversionMode = token.id === '0_utxo' ? 'utxosToAccount' : 'accountToUtxos'
                navigation.navigate({
                  name: 'Convert',
                  params: { mode },
                  merge: true
                })
              }}
              testID='convert_button'
            />
          )
        }
      </ThemedView>
    </ThemedScrollView>
  )
}

function TokenSummary (props: { token: WalletToken}): JSX.Element {
  const Icon = getNativeIcon(props.token.symbol)

  return (
    <ThemedView
      light={tailwind('bg-white')}
      dark={tailwind('bg-black')}
      style={tailwind('px-4 pt-6')}
    >
      <View style={tailwind('flex-row items-center mb-1')}>
        <Icon height={24} width={24} style={tailwind('mr-2')} />
        <ThemedText
          light={tailwind('text-gray-500')}
          dark={tailwind('text-gray-500')}
        >
          {props.token.name}
        </ThemedText>
      </View>

      <View style={tailwind('flex-row items-center mb-4')}>
        <NumberFormat
          decimalScale={8}
          displayType='text'
          renderText={(value) => (
            <ThemedText
              style={tailwind('text-2xl font-bold flex-wrap mr-1')}
              testID='token_detail_amount'
            >
              {value}
            </ThemedText>
          )}
          thousandSeparator
          value={new BigNumber(props.token.amount).toFixed(8)}
        />
        <ThemedText
          light={tailwind('text-gray-500')}
          dark={tailwind('text-gray-500')}
          style={tailwind('text-sm')}
        >
          {props.token.displaySymbol}
        </ThemedText>
      </View>
    </ThemedView>
  )
}
