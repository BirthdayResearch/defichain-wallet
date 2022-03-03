import { CTransactionSegWit } from '@defichain/jellyfish-transaction/dist'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch } from 'redux'
import { NumberRow } from '@components/NumberRow'
import { SubmitButtonGroup } from '@components/SubmitButtonGroup'
import { SummaryTitle } from '@components/SummaryTitle'
import { ThemedScrollView, ThemedSectionTitle, ThemedView } from '@components/themed'
import { RootState } from '@store'
import { firstTransactionSelector, hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { hasTxQueued, transactionQueue } from '@store/transaction_queue'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { DexParamList } from './DexNavigator'
import { getNativeIcon } from '@components/icons/assets'
import { ConversionTag } from '@components/ConversionTag'
import { TextRow } from '@components/TextRow'
import { TransactionResultsRow } from '@components/TransactionResultsRow'
import { FeeInfoRow } from '@components/FeeInfoRow'
import { NativeLoggingProps, useLogger } from '@shared-contexts/NativeLoggingProvider'
import { onTransactionBroadcast } from '@api/transaction/transaction_commands'
import { View } from '@components'
import { InfoText } from '@components/InfoText'
import { WalletAddressRow } from '@components/WalletAddressRow'

type Props = StackScreenProps<DexParamList, 'ConfirmAddLiquidity'>

export function ConfirmAddLiquidityScreen (props: Props): JSX.Element {
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const currentBroadcastJob = useSelector((state: RootState) => firstTransactionSelector(state.ocean))
  const {
    fee,
    percentage,
    tokenABalance,
    tokenAAmount,
    tokenBBalance,
    tokenBAmount
  } = props.route.params.summary
  const pair = props.route.params.pair
  const { conversion } = props.route.params
  const dispatch = useDispatch()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const aToBRate = new BigNumber(pair.tokenB.reserve).div(pair.tokenA.reserve)
  const bToARate = new BigNumber(pair.tokenA.reserve).div(pair.tokenB.reserve)
  const lmTokenAmount = percentage.times(pair.totalLiquidity.token)
  const [isOnPage, setIsOnPage] = useState<boolean>(true)
  const navigation = useNavigation<NavigationProp<DexParamList>>()
  const TokenAIcon = getNativeIcon(pair.tokenA.displaySymbol)
  const TokenBIcon = getNativeIcon(pair.tokenB.displaySymbol)
  const logger = useLogger()

  useEffect(() => {
    setIsOnPage(true)
    return () => {
      setIsOnPage(false)
    }
  }, [])

  async function addLiquidity (): Promise<void> {
    if (hasPendingJob || hasPendingBroadcastJob) {
      return
    }
    setIsSubmitting(true)
    await constructSignedAddLiqAndSend(
      {
        tokenASymbol: pair.tokenA.displaySymbol,
        tokenAId: Number(pair.tokenA.id),
        tokenAAmount,
        tokenBSymbol: pair.tokenB.displaySymbol,
        tokenBId: Number(pair.tokenB.id),
        tokenBAmount
      },
      dispatch,
      () => {
        onTransactionBroadcast(isOnPage, navigation.dispatch)
      },
      logger
    )
    setIsSubmitting(false)
  }

  function onCancel (): void {
    if (!isSubmitting) {
      navigation.navigate({
        name: 'AddLiquidity',
        params: { pair },
        merge: true
      })
    }
  }

  function getSubmitLabel (): string {
    if (!hasPendingBroadcastJob && !hasPendingJob) {
      return 'CONFIRM ADD LIQUIDITY'
    }
    if (hasPendingBroadcastJob && currentBroadcastJob !== undefined && currentBroadcastJob.submitButtonLabel !== undefined) {
      return currentBroadcastJob.submitButtonLabel
    }
    return 'ADDING'
  }

  return (
    <ThemedScrollView
      style={tailwind('pb-4')}
      testID='confirm-root'
    >
      <ThemedView
        dark={tailwind('bg-gray-800 border-b border-gray-700')}
        light={tailwind('bg-white border-b border-gray-300')}
        style={tailwind('flex-col px-4 py-8')}
      >
        <SummaryTitle
          amount={lmTokenAmount}
          suffixType='component'
          testID='text_add_amount'
          title={translate('screens/ConfirmAddLiq', 'You are adding')}
        >
          <TokenAIcon
            height={16}
            width={16}
            style={tailwind('relative z-10 -mt-2')}
            testID={`text_add_amount_suffix_${pair.tokenA.displaySymbol}`}
          />

          <TokenBIcon
            height={16}
            width={16}
            style={tailwind('-ml-2 mt-2 mr-2')}
            testID={`text_add_amount_suffix_${pair.tokenB.displaySymbol}`}
          />
        </SummaryTitle>
        {conversion?.isConversionRequired === true && <ConversionTag />}
      </ThemedView>

      <ThemedSectionTitle
        testID='title_tx_detail'
        text={translate('screens/ConfirmAddLiq', 'TRANSACTION DETAILS')}
      />
      <TextRow
        lhs={translate('screens/ConfirmAddLiq', 'Transaction type')}
        rhs={{
          value: conversion?.isConversionRequired === true ? translate('screens/ConfirmAddLiq', 'Convert & add liquidity') : translate('screens/ConfirmAddLiq', 'Add liquidity'),
          testID: 'text_transaction_type'
        }}
        textStyle={tailwind('text-sm font-normal')}
      />
      <WalletAddressRow />
      <NumberRow
        lhs={translate('screens/ConfirmAddLiq', 'Share of pool')}
        rhs={{
          value: percentage.times(100).toFixed(8),
          suffix: '%',
          testID: 'percentage_pool',
          suffixType: 'text'
        }}
      />

      <NumberRow
        lhs={translate('screens/ConfirmAddLiq', 'Pooled {{symbol}}', { symbol: `${pair.tokenA?.displaySymbol}` })}
        rhs={{
          value: pair.tokenA.reserve,
          testID: 'pooled_a',
          suffixType: 'text',
          suffix: pair.tokenA.displaySymbol
        }}
      />
      <NumberRow
        lhs={translate('screens/ConfirmAddLiq', 'Pooled {{symbol}}', { symbol: `${pair.tokenB?.displaySymbol}` })}
        rhs={{
          value: pair.tokenB.reserve,
          testID: 'pooled_b',
          suffixType: 'text',
          suffix: pair.tokenB.displaySymbol
        }}
      />
      <FeeInfoRow
        type='ESTIMATED_FEE'
        value={fee.toFixed(8)}
        testID='text_fee'
        suffix='DFI'
      />

      <ThemedSectionTitle
        testID='title_add_detail'
        text={translate('screens/ConfirmAddLiq', 'AMOUNT TO SUPPLY')}
      />

      <NumberRow
        lhs={pair.tokenA.displaySymbol}
        rhs={{
          testID: 'a_amount',
          value: BigNumber.max(tokenAAmount, 0).toFixed(8),
          suffixType: 'text',
          suffix: pair.tokenA.displaySymbol
        }}
      />
      <NumberRow
        lhs={pair.tokenB.displaySymbol}
        rhs={{
          testID: 'b_amount',
          value: BigNumber.max(tokenBAmount, 0).toFixed(8),
          suffixType: 'text',
          suffix: pair.tokenB.displaySymbol
        }}
      />

      <ThemedSectionTitle
        testID='title_price_detail'
        text={translate('screens/ConfirmAddLiq', 'PRICE DETAILS')}
      />
      <NumberRow
        lhs={translate('screens/ConfirmAddLiq', '{{tokenA}} price per {{tokenB}}', {
          tokenA: pair.tokenA.displaySymbol,
          tokenB: pair.tokenB.displaySymbol
        })}
        rhs={{
          value: bToARate.toFixed(8),
          testID: 'price_a',
          suffixType: 'text',
          suffix: pair.tokenA.displaySymbol
        }}
      />
      <NumberRow
        lhs={translate('screens/ConfirmAddLiq', '{{tokenA}} price per {{tokenB}}', {
          tokenA: pair.tokenB.displaySymbol,
          tokenB: pair.tokenA.displaySymbol
        })}
        rhs={{
          value: aToBRate.toFixed(8),
          testID: 'price_b',
          suffixType: 'text',
          suffix: pair.tokenB.displaySymbol
        }}
      />

      <TransactionResultsRow
        tokens={[
          {
            symbol: pair.tokenA.displaySymbol,
            value: tokenABalance.minus(tokenAAmount).toFixed(8),
            suffix: pair.tokenA.displaySymbol
          },
          {
            symbol: pair.tokenB.displaySymbol,
            value: tokenBBalance.minus(tokenBAmount).toFixed(8),
            suffix: pair.tokenB.displaySymbol
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
        label={translate('screens/ConfirmAddLiq', 'CONFIRM ADD LIQUIDITY')}
        isProcessing={isSubmitting || hasPendingJob || hasPendingBroadcastJob}
        processingLabel={translate('screens/ConfirmAddLiq', getSubmitLabel())}
        onCancel={onCancel}
        displayCancelBtn
        onSubmit={addLiquidity}
        title='add'
      />
    </ThemedScrollView>
  )
}

async function constructSignedAddLiqAndSend (
  addLiqForm: { tokenASymbol: string, tokenAId: number, tokenAAmount: BigNumber, tokenBSymbol: string, tokenBId: number, tokenBAmount: BigNumber },
  dispatch: Dispatch<any>,
  onBroadcast: () => void,
  logger: NativeLoggingProps
): Promise<void> {
  try {
    const signer = async (account: WhaleWalletAccount): Promise<CTransactionSegWit> => {
      const builder = account.withTransactionBuilder()
      const script = await account.getScript()

      const addLiq = {
        from: [{
          script,
          balances: [
            {
              token: addLiqForm.tokenAId,
              amount: addLiqForm.tokenAAmount
            },
            {
              token: addLiqForm.tokenBId,
              amount: addLiqForm.tokenBAmount
            }
          ]
        }],
        shareAddress: script
      }

      const dfTx = await builder.liqPool.addLiquidity(addLiq, script)
      return new CTransactionSegWit(dfTx)
    }

    dispatch(transactionQueue.actions.push({
      sign: signer,
      title: translate('screens/ConfirmAddLiq', 'Adding Liquidity'),
      description: translate('screens/ConfirmAddLiq', 'Adding {{amountA}} {{symbolA}} - {{amountB}} {{symbolB}}', {
        amountA: addLiqForm.tokenAAmount.toFixed(8),
        symbolA: addLiqForm.tokenASymbol,
        amountB: addLiqForm.tokenBAmount.toFixed(8),
        symbolB: addLiqForm.tokenBSymbol
      }),
      onBroadcast
    }))
  } catch (e) {
    logger.error(e)
  }
}
