import { CTransactionSegWit, PoolSwap } from '@defichain/jellyfish-transaction/dist'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import React, { Dispatch, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { NumberRow } from '@components/NumberRow'
import { SubmitButtonGroup } from '@components/SubmitButtonGroup'
import { SummaryTitle } from '@components/SummaryTitle'
import { ThemedIcon, ThemedScrollView, ThemedSectionTitle, ThemedView } from '@components/themed'
import { RootState } from '@store'
import { firstTransactionSelector, hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { hasTxQueued, transactionQueue } from '@store/transaction_queue'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { DexParamList } from '../DexNavigator'
import { DerivedTokenState } from './PoolSwapScreen'
import { getNativeIcon } from '@components/icons/assets'
import { ConversionTag } from '@components/ConversionTag'
import { FeeInfoRow } from '@components/FeeInfoRow'
import { NativeLoggingProps, useLogger } from '@shared-contexts/NativeLoggingProvider'
import { TextRow } from '@components/TextRow'
import { TransactionResultsRow } from '@components/TransactionResultsRow'
import { onTransactionBroadcast } from '@api/transaction/transaction_commands'
import { InfoText } from '@components/InfoText'
import { View } from '@components'

type Props = StackScreenProps<DexParamList, 'ConfirmPoolSwapScreen'>

export function ConfirmPoolSwapScreen ({ route }: Props): JSX.Element {
  const {
    tokenA,
    tokenB,
    fee,
    swap,
    pair,
    slippage,
    priceRateA,
    priceRateB
  } = route.params
  const { conversion } = route.params
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const currentBroadcastJob = useSelector((state: RootState) => firstTransactionSelector(state.ocean))
  const dispatch = useDispatch()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigation = useNavigation<NavigationProp<DexParamList>>()
  const [isOnPage, setIsOnPage] = useState<boolean>(true)
  const logger = useLogger()
  const TokenAIcon = getNativeIcon(tokenA.displaySymbol)
  const TokenBIcon = getNativeIcon(tokenB.displaySymbol)

  useEffect(() => {
    setIsOnPage(true)
    return () => {
      setIsOnPage(false)
    }
  }, [])

  async function onSubmit (): Promise<void> {
    if (hasPendingJob || hasPendingBroadcastJob) {
      return
    }
    setIsSubmitting(true)
    await constructSignedSwapAndSend(swap, slippage, dispatch, () => {
      onTransactionBroadcast(isOnPage, navigation.dispatch)
    }, logger)
    setIsSubmitting(false)
  }

  function onCancel (): void {
    if (!isSubmitting) {
      navigation.navigate({
        name: 'PoolSwap',
        params: { pair },
        merge: true
      })
    }
  }

  function getSubmitLabel (): string {
    if (!hasPendingBroadcastJob && !hasPendingJob) {
      return 'CONFIRM SWAP'
    }
    if (hasPendingBroadcastJob && currentBroadcastJob !== undefined && currentBroadcastJob.submitButtonLabel !== undefined) {
      return currentBroadcastJob.submitButtonLabel
    }
    return 'SWAPPING'
  }

  return (
    <ThemedScrollView style={tailwind('pb-4')}>
      <ThemedView
        dark={tailwind('bg-gray-800 border-b border-gray-700')}
        light={tailwind('bg-white border-b border-gray-300')}
        style={tailwind('flex-col px-4 py-8')}
      >
        <SummaryTitle
          amount={swap.fromAmount}
          suffixType='component'
          testID='text_swap_amount'
          title={translate('screens/PoolSwapConfirmScreen', 'You are swapping')}
        >
          <TokenAIcon height={24} width={24} style={tailwind('ml-1')} />
          <ThemedIcon iconType='MaterialIcons' name='arrow-right-alt' size={24} style={tailwind('px-1')} />
          <TokenBIcon height={24} width={24} />
        </SummaryTitle>
        {conversion?.isConversionRequired === true && <ConversionTag />}
      </ThemedView>

      <ThemedSectionTitle
        testID='title_tx_detail'
        text={translate('screens/PoolSwapConfirmScreen', 'TRANSACTION DETAILS')}
      />

      <TextRow
        lhs={translate('screens/PoolSwapConfirmScreen', 'Transaction type')}
        rhs={{
          value: conversion?.isConversionRequired === true ? translate('screens/PoolSwapConfirmScreen', 'Convert & swap') : translate('screens/PoolSwapConfirmScreen', 'Swap'),
          testID: 'text_transaction_type'
        }}
        textStyle={tailwind('text-sm font-normal')}
      />
      <NumberRow
        lhs={translate('screens/PoolSwapConfirmScreen', 'Estimated to receive')}
        rhs={{
          testID: 'estimated_to_receive',
          value: swap.toAmount.toFixed(8),
          suffixType: 'text',
          suffix: swap.toToken.displaySymbol
        }}
      />
      <FeeInfoRow
        type='ESTIMATED_FEE'
        value={fee.toFixed(8)}
        testID='text_fee'
        suffix='DFI'
      />

      <ThemedSectionTitle
        testID='title_price_details'
        text={translate('screens/PoolSwapConfirmScreen', 'PRICE DETAILS')}
      />
      <NumberRow
        lhs={translate('screens/PoolSwapConfirmScreen', '{{tokenA}} price per {{tokenB}}', {
          tokenA: tokenA.displaySymbol,
          tokenB: tokenB.displaySymbol
        })}
        rhs={{
          testID: 'price_a',
          value: priceRateA,
          suffixType: 'text',
          suffix: tokenA.displaySymbol
        }}
      />
      <NumberRow
        lhs={translate('screens/PoolSwapConfirmScreen', '{{tokenA}} price per {{tokenB}}', {
          tokenA: tokenB.displaySymbol,
          tokenB: tokenA.displaySymbol
        })}
        rhs={{
          testID: 'price_b',
          value: priceRateB,
          suffixType: 'text',
          suffix: tokenB.displaySymbol
        }}
      />
      <NumberRow
        lhs={translate('screens/PoolSwapConfirmScreen', 'Slippage Tolerance')}
        lhsIcon={<ThemedIcon
          size={17}
          name='info-outline'
          iconType='MaterialIcons'
          dark={tailwind('text-gray-200')}
          light={tailwind('text-gray-700')}
          style={tailwind('ml-2')}
                 />}
        rhs={{
          value: new BigNumber(slippage).times(100).toFixed(),
          suffix: '%',
          testID: 'slippage_fee',
          suffixType: 'text'
        }}
      />
      <NumberRow
        lhs={translate('screens/PoolSwapConfirmScreen', 'Max Price per {{fromToken}}', {
          fromToken: swap.fromToken.displaySymbol
        })}
        rhs={{
          value: swap.fromAmount.div(swap.toAmount).times(1 + slippage).toFixed(),
          suffix: swap.toToken.displaySymbol,
          testID: 'max_price',
          suffixType: 'text'
        }}
      />

      <TransactionResultsRow
        tokens={[
          {
            symbol: tokenA.displaySymbol,
            value: BigNumber.max(new BigNumber(tokenA.amount).minus(swap.fromAmount), 0).toFixed(8),
            suffix: tokenA.displaySymbol
          },
          {
            symbol: tokenB.displaySymbol,
            value: BigNumber.max(new BigNumber(tokenB.amount).plus(swap.toAmount), 0).toFixed(8),
            suffix: tokenB.displaySymbol
          }
        ]}
      />

      {conversion?.isConversionRequired === true && (
        <View style={tailwind('p-4 mt-2')}>
          <InfoText
            testID='conversion_warning_info_text'
            text={translate('components/ConversionInfoText', 'Please wait as we convert tokens for your transaction. Conversions are irreversible.')}
          />
        </View>
      )}

      <SubmitButtonGroup
        isDisabled={isSubmitting || hasPendingJob || hasPendingBroadcastJob}
        label={translate('screens/PoolSwapConfirmScreen', 'CONFIRM SWAP')}
        isProcessing={isSubmitting || hasPendingJob || hasPendingBroadcastJob}
        processingLabel={translate('screens/PoolSwapConfirmScreen', getSubmitLabel())}
        onCancel={onCancel}
        onSubmit={onSubmit}
        title='swap'
      />
    </ThemedScrollView>
  )
}

export interface DexForm {
  fromToken: DerivedTokenState
  toToken: DerivedTokenState
  fromAmount: BigNumber
  toAmount: BigNumber
}

async function constructSignedSwapAndSend (
  dexForm: DexForm,
  slippage: BigNumber,
  dispatch: Dispatch<any>,
  onBroadcast: () => void,
  logger: NativeLoggingProps
): Promise<void> {
  try {
    const maxPrice = dexForm.fromAmount.div(dexForm.toAmount).times(slippage.plus(1)).decimalPlaces(8)
    const signer = async (account: WhaleWalletAccount): Promise<CTransactionSegWit> => {
      const builder = account.withTransactionBuilder()
      const script = await account.getScript()

      const swap: PoolSwap = {
        fromScript: script,
        toScript: script,
        fromTokenId: Number(dexForm.fromToken.id === '0_unified' ? '0' : dexForm.fromToken.id),
        toTokenId: Number(dexForm.toToken.id === '0_unified' ? '0' : dexForm.toToken.id),
        fromAmount: dexForm.fromAmount,
        maxPrice: maxPrice
      }
      const dfTx = await builder.dex.poolSwap(swap, script)
      return new CTransactionSegWit(dfTx)
    }

    dispatch(transactionQueue.actions.push({
      sign: signer,
      title: translate('screens/PoolSwapConfirmScreen', 'Swapping Token'),
      description: translate('screens/PoolSwapConfirmScreen', 'Swapping {{amountA}} {{symbolA}} to {{amountB}} {{symbolB}}', {
        amountA: dexForm.fromAmount.toFixed(8),
        symbolA: dexForm.fromToken.displaySymbol,
        amountB: dexForm.toAmount.toFixed(8),
        symbolB: dexForm.toToken.displaySymbol
      }),
      onBroadcast
    }))
  } catch (e) {
    logger.error(e)
  }
}
