import React from 'react'
import { View } from 'react-native'
import { getNativeIcon } from '@components/icons/assets'
import { ThemedIcon, ThemedScrollView, ThemedText } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'

export function TokensVsUtxoScreen (): JSX.Element {
  return (
    <ThemedScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'space-between'
      }}
      style={tailwind('h-full')}
      testID='token_vs_utxo_screen'
    >
      <View style={tailwind('pt-6 px-4 border-b-2 border-gray-200')}>
        <ThemedText style={tailwind('pb-6')}>
          {translate('screens/TokensVsUtxoScreen', 'DFI exists in two forms – UTXO and token, which are interchangeable depending on the usage. You can easily convert between the two forms with the app.')}
        </ThemedText>

        <ThemedText style={tailwind('pb-6')}>
          {translate('screens/TokensVsUtxoScreen', 'UTXO DFI is the main form DFI and is used for core cryptocurrency purposes like send, receive and fees. DFI tokens are used for DeFi functions such as swaps and liquidity mining.')}
        </ThemedText>

        <ThemedText style={tailwind('pb-4')}>
          {translate('screens/TokensVsUtxoScreen', 'Your DFI balance includes both UTXO and tokens.')}
        </ThemedText>
      </View>

      <View style={tailwind('flex flex-row flex-grow self-stretch items-stretch')}>
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
    </ThemedScrollView>
  )
}

function ComparisonTitle (props: {tokenUnit: '_UTXO' | 'DFI'}): JSX.Element {
  const TokenIcon = getNativeIcon(props.tokenUnit)
  const label = props.tokenUnit === '_UTXO' ? 'DFI (UTXO)' : 'DFI (Token)'

  return (
    <View style={tailwind('flex flex-row items-center pb-5')}>
      <TokenIcon style={tailwind('mr-2')} />

      <ThemedText style={tailwind('text-lg')}>
        {translate('screens/TokensVsUtxoScreen', label)}
      </ThemedText>
    </View>
  )
}

function ComparisonRow (props: {label: string}): JSX.Element {
  return (
    <View style={tailwind('flex flex-row pb-2')}>
      <ThemedIcon
        dark={tailwind('text-darksuccess-500')}
        iconType='MaterialIcons'
        light={tailwind('text-success-500')}
        name='check'
        size={24}
        style={tailwind('mr-2')}
      />

      <ThemedText
        style={tailwind('text-sm font-medium flex-1')}
      >
        {translate('screens/TokensVsUtxoScreen', props.label)}
      </ThemedText>
    </View>
  )
}
