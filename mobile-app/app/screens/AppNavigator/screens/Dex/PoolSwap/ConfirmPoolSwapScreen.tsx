import { CTransactionSegWit, PoolSwap } from '@defichain/jellyfish-transaction/dist'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { NavigationProp, StackActions, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import React, { Dispatch, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Logging } from '@api'
import { NumberRow } from '@components/NumberRow'
import { SubmitButtonGroup } from '@components/SubmitButtonGroup'
import { SummaryTitle } from '@components/SummaryTitle'
import { ThemedIcon, ThemedScrollView, ThemedSectionTitle, ThemedView } from '@components/themed'
import { RootState } from '@store'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { hasTxQueued, transactionQueue } from '@store/transaction_queue'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { DexParamList } from '../DexNavigator'
import { DerivedTokenState } from './PoolSwapScreen'
import { getNativeIcon } from '@components/icons/assets'
import { DFITokenSelector } from '@store/wallet'
import { ConversionTag } from '@components/ConversionTag'
import { EstimatedFeeInfo } from '@components/EstimatedFeeInfo'
import { TextRow } from '@components/TextRow'
import { ConversionDetailsRow } from '@components/ConversionDetailsRow'
import { TransactionResultsRow } from '@components/TransactionResultsRow'

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
  const [tokenDFI, setTokenDFI] = useState(route.params.tokenB)
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const dispatch = useDispatch()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigation = useNavigation<NavigationProp<DexParamList>>()
  const [isOnPage, setIsOnPage] = useState<boolean>(true)
  const postAction = (): void => {
    if (isOnPage) {
      navigation.dispatch(StackActions.popToTop())
    }
  }
  const TokenAIcon = getNativeIcon(tokenA.displaySymbol)
  const TokenBIcon = getNativeIcon(tokenB.displaySymbol)
  const DFIToken = useSelector((state: RootState) => DFITokenSelector(state.wallet))
  const [isConversionRequired, setIsConversionRequired] = useState(false)

  useEffect(() => {
    setIsOnPage(true)
    return () => {
      setIsOnPage(false)
    }
  }, [])

  useEffect(() => {
    const poolswapDFIAmount = getPoolswapDFIAmount(swap)
    if (swap.fromToken.id === '0_unified' && poolswapDFIAmount.isGreaterThan(new BigNumber(DFIToken.amount))) {
      setIsConversionRequired(true)
    }
    if (swap.fromToken.id === '0_unified') {
      setTokenDFI(tokenA)
    } else {
      setTokenDFI(tokenB)
    }
  }, [])

  function getPoolswapDFIAmount (swap: DexForm): BigNumber {
    if (swap.fromToken.id === '0_unified') {
      return swap.fromAmount
    } else {
      return swap.toAmount
    }
  }

  async function onSubmit (): Promise<void> {
    if (hasPendingJob || hasPendingBroadcastJob) {
      return
    }
    setIsSubmitting(true)
    await constructSignedSwapAndSend(swap, slippage, dispatch, postAction)
    setIsSubmitting(false)
  }

  function onCancel (): void {
    if (!isSubmitting) {
      navigation.navigate({ name: 'PoolSwap', params: { pair }, merge: true })
    }
  }

  return (
    <ThemedScrollView style={tailwind('pb-4')}>
      <ThemedView
        dark={tailwind('bg-gray-800 border-b border-gray-700')}
        light={tailwind('bg-white border-b border-gray-300')}
        style={tailwind('flex-col px-4 py-8 mb-4')}
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
        {isConversionRequired && <ConversionTag />}
      </ThemedView>

      <ThemedSectionTitle
        testID='title_tx_detail'
        text={translate('screens/PoolSwapConfirmScreen', 'TRANSACTION DETAILS')}
      />

      <TextRow
        lhs={translate('screens/PoolSwapConfirmScreen', 'Transaction type')}
        rhs={{
          value: isConversionRequired ? translate('screens/PoolSwapConfirmScreen', 'Convert & swap') : translate('screens/PoolSwapConfirmScreen', 'Swap'),
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
      <EstimatedFeeInfo
        lhs={translate('screens/PoolSwapConfirmScreen', 'Estimated fee')}
        rhs={{ value: fee.toFixed(8), testID: 'text_fee', suffix: 'DFI' }}
      />

      <ThemedSectionTitle
        testID='title_price_details'
        text={translate('screens/PoolSwapConfirmScreen', 'PRICE DETAILS')}
      />
      <NumberRow
        lhs={translate('screens/PoolSwapConfirmScreen', '{{tokenA}} price per {{tokenB}}', { tokenA: tokenA.displaySymbol, tokenB: tokenB.displaySymbol })}
        rhs={{
          testID: 'price_a',
          value: priceRateA,
          suffixType: 'text',
          suffix: tokenA.displaySymbol
        }}
      />
      <NumberRow
        lhs={translate('screens/PoolSwapConfirmScreen', '{{tokenA}} price per {{tokenB}}', { tokenA: tokenB.displaySymbol, tokenB: tokenA.displaySymbol })}
        rhs={{
          testID: 'price_b',
          value: priceRateB,
          suffixType: 'text',
          suffix: tokenB.displaySymbol
        }}
      />
      <NumberRow
        lhs={translate('screens/PoolSwapConfirmScreen', 'Slippage Tolerance')}
        rhs={{
          value: new BigNumber(slippage).times(100).toFixed(),
          suffix: '%',
          testID: 'slippage_fee',
          suffixType: 'text'
        }}
      />

      {isConversionRequired &&
        <ConversionDetailsRow
          utxoBalance={new BigNumber(tokenDFI.amount ?? 0).minus(getPoolswapDFIAmount(swap)).toFixed(8)}
          tokenBalance={new BigNumber(0).toFixed(8)}
        />}

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

      <SubmitButtonGroup
        isDisabled={isSubmitting || hasPendingJob || hasPendingBroadcastJob}
        label={translate('screens/PoolSwapConfirmScreen', 'CONFIRM SWAP')}
        isSubmitting={isSubmitting || hasPendingJob || hasPendingBroadcastJob}
        submittingLabel={translate('screens/PoolSwapConfirmScreen', 'SWAPPING')}
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
  slippage: number,
  dispatch: Dispatch<any>,
  postAction: () => void
): Promise<void> {
  try {
    const maxPrice = dexForm.fromAmount.div(dexForm.toAmount).times(1 + slippage).decimalPlaces(8)
    const signer = async (account: WhaleWalletAccount): Promise<CTransactionSegWit> => {
      const builder = account.withTransactionBuilder()
      const script = await account.getScript()

      const swap: PoolSwap = {
        fromScript: script,
        toScript: script,
        fromTokenId: Number(dexForm.fromToken.id),
        toTokenId: Number(dexForm.toToken.id),
        fromAmount: dexForm.fromAmount,
        maxPrice
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
      postAction
    }))
  } catch (e) {
    Logging.error(e)
  }
}
