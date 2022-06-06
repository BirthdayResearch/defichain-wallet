
import { View } from 'react-native'
import { getNativeIcon } from '@components/icons/assets'
import { ThemedIcon, ThemedScrollView, ThemedText } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'

export function TokensVsUtxoScreen (): JSX.Element {
  return (
    <ThemedScrollView
      contentContainerStyle={tailwind('p-6 pb-8')}
      testID='token_vs_utxo_screen'
    >
      <View style={tailwind('pb-6')}>
        <ThemedText style={tailwind('pb-2 text-lg font-semibold')}>
          {translate('screens/TokensVsUtxoScreen', 'Learn about UTXOs and Tokens')}
        </ThemedText>

        <ThemedText
          light={tailwind('text-gray-700')}
          dark={tailwind('text-gray-200')}
        >
          {translate('screens/TokensVsUtxoScreen', 'DFI exists in two forms - UTXO and Token. They can be converted with one another to serve different use cases within your light wallet.')}
        </ThemedText>
      </View>
      <FaqInfoSection
        title='DFI in UTXO form'
        description='DFI in UTXO form is the primary form of DFI. It is used for core cryptocurrency purposes such as send, receive and fees.'
        tokenUnit='_UTXO'
        useCases={[
          'Sending DFI to other wallets',
          'Receiving DFI from other wallets',
          'Transaction fees'
        ]}
      />
      <FaqInfoSection
        title='DFI in token form'
        description='DFIs in token form are used for various DeFiChain functions such as Liquidity Pools, Loans, Auctions and DEX swaps.'
        tokenUnit='DFI'
        useCases={[
          'Swapping DFI with other tokens (e.g. dBTC, dETH, dUSDT)',
          'Liquidity pools',
          'Auctions and Loans'
        ]}
      />
    </ThemedScrollView>
  )
}

interface FaqInfoSectionProps {
  title: string
  description: string
  tokenUnit: '_UTXO' | 'DFI'
  useCases: string[]
}

function FaqInfoSection (props: FaqInfoSectionProps): JSX.Element {
  const TokenIcon = getNativeIcon(props.tokenUnit)
  return (
    <View style={tailwind('mb-6')}>
      <View style={tailwind('flex-row items-center flex-grow mb-2')}>
        <TokenIcon width={24} height={24} />
        <View style={tailwind('ml-2 flex-auto')}>
          <ThemedText
            dark={tailwind('text-gray-200')}
            light={tailwind('text-black')}
            style={tailwind('text-lg font-semibold')}
          >
            {translate('screens/TokensVsUtxoScreen', props.title)}
          </ThemedText>
        </View>
      </View>
      <View style={tailwind('mb-4')}>
        <ThemedText
          light={tailwind('text-gray-700')}
          dark={tailwind('text-gray-200')}
        >
          {translate('screens/TokensVsUtxoScreen', props.description)}
        </ThemedText>
      </View>
      <View style={tailwind('mb-2')}>
        <ThemedText
          light={tailwind('text-gray-700')}
          dark={tailwind('text-gray-200')}
          style={tailwind('text-sm')}
        >
          {translate('screens/TokensVsUtxoScreen', 'Use cases include:')}
        </ThemedText>
      </View>
      {props.useCases.map((label) => <UseCaseRow key={label} label={label} />)}
    </View>
  )
}

function UseCaseRow (props: {label: string}): JSX.Element {
  return (
    <View style={tailwind('flex-row items-start flex-grow mb-2')}>
      <ThemedIcon
        size={16}
        name='check-circle'
        iconType='MaterialIcons'
        light={tailwind('text-success-500')}
        dark={tailwind('text-darksuccess-500')}
        style={tailwind('mt-0.5')}
      />
      <View style={tailwind('ml-2 flex-auto')}>
        <ThemedText
          light={tailwind('text-gray-700')}
          dark={tailwind('text-gray-200')}
          style={tailwind('text-sm')}
        >
          {translate('screens/TokensVsUtxoScreen', props.label)}
        </ThemedText>
      </View>
    </View>
  )
}
