import React from 'react'
import { tailwind } from '@tailwind'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import { translate } from '@translations'
import { ThemedIcon, ThemedScrollView, ThemedSectionTitle, ThemedView } from '@components/themed'
import { TextRow } from '@components/TextRow'
import { NumberRow } from '@components/NumberRow'
import { FeeInfoRow } from '@components/FeeInfoRow'
import { PricesSection } from './components/PricesSection'
import { TransactionResultsRow } from '@components/TransactionResultsRow'
import { SubmitButtonGroup } from '@components/SubmitButtonGroup'
import { SummaryTitle } from '@components/SummaryTitle'
import { getNativeIcon } from '@components/icons/assets'
import { DerivedTokenState } from './CompositeSwapScreen'
import { DexParamList } from '../DexNavigator'

type Props = StackScreenProps<DexParamList, 'ConfirmCompositeSwapScreen'>
export interface CompositeSwapForm {
  tokenFrom: DerivedTokenState
  tokenTo: DerivedTokenState
  amountFrom: BigNumber
  amountTo: BigNumber
}

export function ConfirmCompositeSwapScreen ({ route }: Props): JSX.Element {
  const {
    fee,
    priceRates,
    slippage,
    swap,
    tokenA,
    tokenB
  } = route.params
  const TokenAIcon = getNativeIcon(tokenA.displaySymbol)
  const TokenBIcon = getNativeIcon(tokenB.displaySymbol)

  async function onSubmit (): Promise<void> {
  }

  return (
    <ThemedScrollView style={tailwind('pb-4')}>
      <ThemedView
        dark={tailwind('bg-gray-800 border-b border-gray-700')}
        light={tailwind('bg-white border-b border-gray-300')}
        style={tailwind('flex-col px-4 py-8')}
      >
        <SummaryTitle
          amount={swap.amountFrom}
          suffixType='component'
          testID='text_swap_amount'
          title={translate('screens/ConfirmCompositePoolSwapScreen', 'You are swapping')}
        >
          <TokenAIcon height={24} width={24} style={tailwind('ml-1')} />
          <ThemedIcon iconType='MaterialIcons' name='arrow-right-alt' size={24} style={tailwind('px-1')} />
          <TokenBIcon height={24} width={24} />
        </SummaryTitle>
      </ThemedView>

      <ThemedSectionTitle
        testID='title_tx_detail'
        text={translate('screens/ConfirmCompositePoolSwapScreen', 'TRANSACTION DETAILS')}
      />
      <TextRow
        lhs={translate('screens/ConfirmCompositePoolSwapScreen', 'Transaction type')}
        rhs={{
          value: translate('screens/ConfirmCompositePoolSwapScreen', 'Swap'),
          testID: 'text_transaction_type'
        }}
        textStyle={tailwind('text-sm font-normal')}
      />
      <NumberRow
        lhs={translate('screens/ConfirmCompositePoolSwapScreen', 'Estimated to receive')}
        rhs={{
          testID: 'estimated_to_receive',
          value: swap.amountTo.toFixed(8),
          suffixType: 'text',
          suffix: swap.tokenTo.displaySymbol
        }}
      />
      <FeeInfoRow
        type='ESTIMATED_FEE'
        value={fee.toFixed(8)}
        testID='text_fee'
        suffix='DFI'
      />
      <NumberRow
        lhs={translate('screens/ConfirmCompositePoolSwapScreen', 'Slippage Tolerance')}
        rhs={{
          value: new BigNumber(slippage).times(100).toFixed(),
          suffix: '%',
          testID: 'slippage_fee',
          suffixType: 'text'
        }}
      />
      <PricesSection priceRates={priceRates} sectionTitle='PRICE DETAILS' />
      <TransactionResultsRow
        tokens={[
          {
            symbol: tokenA.displaySymbol,
            value: BigNumber.max(new BigNumber(tokenA.amount).minus(swap.amountFrom), 0).toFixed(8),
            suffix: tokenA.displaySymbol
          },
          {
            symbol: tokenB.displaySymbol,
            value: BigNumber.max(new BigNumber(tokenB.amount).plus(swap.amountTo), 0).toFixed(8),
            suffix: tokenB.displaySymbol
          }
        ]}
      />
      <SubmitButtonGroup
        isDisabled={false}
        label={translate('screens/ConfirmCompositePoolSwapScreen', 'CONFIRM SWAP')}
        isProcessing={false}
        processingLabel={translate('screens/ConfirmCompositePoolSwapScreen', 'SWAPPING')}
        onCancel={() => {}}
        onSubmit={onSubmit}
        title='swap'
      />
    </ThemedScrollView>
  )
}
