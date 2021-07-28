import { MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { View } from 'react-native'
import { Text } from '../../../../../components'
import { translate } from '../../../../../translations'
import { tailwind } from '../../../../../tailwind'
import { getTokenIcon } from '../../../../../components/icons/tokens/_index'

export function TokensVsUtxoScreen (): JSX.Element {
  return (
    <View testID='token_vs_utxo_screen'>
      <View style={tailwind('pt-6 px-4 border-b-2 border-gray-200')}>
        <Text style={tailwind('text-black pb-6')}>
          {translate('screens/ConvertScreen', 'DFI exists in two forms – UTXO and token, which are interchangeable depending on the usage. You can easily convert between the two forms with the app.')}
        </Text>
        <Text style={tailwind('text-black pb-6')}>
          {translate('screens/ConvertScreen', 'UTXO DFI is the main form DFI and is used for core cryptocurrency purposes like send, receive and fees. DFI tokens are used for DeFi functions such as swaps and liquidity mining.')}
        </Text>
        <Text style={tailwind('text-black pb-4')}>
          {translate('screens/ConvertScreen', 'Your DFI balance includes both UTXO and tokens.')}
        </Text>
      </View>
      <View style={tailwind('flex flex-row h-full')}>
        <View style={tailwind('w-6/12 border-r-2 border-gray-200 px-4 py-5')}>
          <ComparisonTitle tokenUnit='_UTXO' />
          <ComparisonRow label='Core crypto services' />
          <ComparisonRow label='Send to other wallets' />
          <ComparisonRow label='Receive tokens' />
          <ComparisonRow label='Service fees' />
        </View>
        <View style={tailwind('w-6/12 px-4 py-5')}>
          <ComparisonTitle tokenUnit='DFI' />
          <ComparisonRow label='DeFi services' />
          <ComparisonRow label='Liquidity mining' />
          <ComparisonRow label='Atomic Swaps' />
        </View>
      </View>
    </View>
  )
}

function ComparisonTitle (props: {tokenUnit: '_UTXO' | 'DFI'}): JSX.Element {
  const TokenIcon = getTokenIcon(props.tokenUnit)
  const label = props.tokenUnit === '_UTXO' ? 'DFI (UTXO)' : 'DFI (Token)'

  return (
    <View style={tailwind('flex flex-row items-center pb-5')}>
      <TokenIcon width={24} height={24} style={tailwind('mr-2')} />
      <Text style={tailwind('text-lg')}>{translate('screens/ConvertScreen', label)}</Text>
    </View>
  )
}

function ComparisonRow (props: {label: string}): JSX.Element {
  return (
    <View style={tailwind('flex flex-row pb-2')}>
      <MaterialIcons name='check' size={24} style={tailwind('text-green-500 mr-2')} />
      <Text style={tailwind('text-sm font-medium')}>{translate('screens/ConvertScreen', props.label)}</Text>
    </View>
  )
}
