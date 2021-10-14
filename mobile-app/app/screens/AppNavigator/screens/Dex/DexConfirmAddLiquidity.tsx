import { CTransactionSegWit } from '@defichain/jellyfish-transaction/dist'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch } from 'redux'
import { NumberRow } from '@components/NumberRow'
import { SubmitButtonGroup } from '@components/SubmitButtonGroup'
import { SummaryTitle } from '@components/SummaryTitle'
import { ThemedScrollView, ThemedSectionTitle } from '@components/themed'
import { RootState } from '@store'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { hasTxQueued, transactionQueue } from '@store/transaction_queue'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { DexParamList } from './DexNavigator'
import { getNativeIcon } from '@components/icons/assets'
import { EstimatedFeeInfo } from '@components/EstimatedFeeInfo'
import { NativeLoggingProps, useLogger } from '@shared-contexts/NativeLoggingProvider'
import { onTransactionBroadcast } from '@api/transaction/transaction_commands'

type Props = StackScreenProps<DexParamList, 'ConfirmAddLiquidity'>

export function ConfirmAddLiquidityScreen (props: Props): JSX.Element {
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const {
    fee,
    percentage,
    tokenA,
    tokenAAmount,
    tokenB,
    tokenBAmount,
    totalLiquidity
  } = props.route.params.summary
  const pair = props.route.params.pair
  const [isSubmitting, setIsSubmitting] = useState(false)
  const aToBRate = new BigNumber(tokenB.reserve).div(tokenA.reserve)
  const bToARate = new BigNumber(tokenA.reserve).div(tokenB.reserve)
  const lmTokenAmount = percentage.times(totalLiquidity.token)
  const [isOnPage, setIsOnPage] = useState<boolean>(true)
  const navigation = useNavigation<NavigationProp<DexParamList>>()
  const logger = useLogger()
  const TokenAIcon = getNativeIcon(tokenA.displaySymbol)
  const TokenBIcon = getNativeIcon(tokenB.displaySymbol)

  useEffect(() => {
    setIsOnPage(true)
    return () => {
      setIsOnPage(false)
    }
  }, [])

  const dispatch = useDispatch()

  async function addLiquidity (): Promise<void> {
    if (hasPendingJob || hasPendingBroadcastJob) {
      return
    }
    setIsSubmitting(true)
    await constructSignedAddLiqAndSend(
      {
        tokenASymbol: tokenA.displaySymbol,
        tokenAId: Number(tokenA.id),
        tokenAAmount,
        tokenBSymbol: tokenB.displaySymbol,
        tokenBId: Number(tokenB.id),
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

  return (
    <ThemedScrollView
      style={tailwind('pb-4')}
      testID='confirm-root'
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
          testID={`text_add_amount_suffix_${tokenA.displaySymbol}`}
        />

        <TokenBIcon
          height={16}
          width={16}
          style={tailwind('-ml-2 mt-2 mr-2')}
          testID={`text_add_amount_suffix_${tokenB.displaySymbol}`}
        />
      </SummaryTitle>

      <ThemedSectionTitle
        testID='title_add_detail'
        text={translate('screens/ConfirmAddLiq', 'AMOUNT TO SUPPLY')}
      />

      <NumberRow
        lhs={tokenA.displaySymbol}
        rhs={{
          testID: 'a_amount',
          value: BigNumber.max(tokenAAmount, 0).toFixed(8),
          suffixType: 'text',
          suffix: tokenA.displaySymbol
        }}
      />
      <NumberRow
        lhs={tokenB.displaySymbol}
        rhs={{
          testID: 'b_amount',
          value: BigNumber.max(tokenBAmount, 0).toFixed(8),
          suffixType: 'text',
          suffix: tokenB.displaySymbol
        }}
      />

      <ThemedSectionTitle
        testID='title_price_detail'
        text={translate('screens/ConfirmAddLiq', 'PRICE DETAILS')}
      />
      <NumberRow
        lhs={translate('screens/ConfirmAddLiq', '{{tokenA}} price per {{tokenB}}', {
          tokenA: tokenA.displaySymbol,
          tokenB: tokenB.displaySymbol
        })}
        rhs={{
          value: aToBRate.toFixed(8),
          testID: 'price_a',
          suffixType: 'text',
          suffix: tokenA.displaySymbol
        }}
      />
      <NumberRow
        lhs={translate('screens/ConfirmAddLiq', '{{tokenA}} price per {{tokenB}}', {
          tokenA: tokenB.displaySymbol,
          tokenB: tokenA.displaySymbol
        })}
        rhs={{
          value: bToARate.toFixed(8),
          testID: 'price_b',
          suffixType: 'text',
          suffix: tokenB.displaySymbol
        }}
      />

      <ThemedSectionTitle
        testID='title_tx_detail'
        text={translate('screens/ConfirmAddLiq', 'TRANSACTION DETAILS')}
      />
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
        lhs={translate('screens/ConfirmAddLiq', 'Your pooled {{symbol}}', { symbol: `${tokenA?.displaySymbol}` })}
        rhs={{
          value: tokenA.reserve,
          testID: 'pooled_a',
          suffixType: 'text',
          suffix: tokenA.displaySymbol
        }}
      />
      <NumberRow
        lhs={translate('screens/ConfirmAddLiq', 'Your pooled {{symbol}}', { symbol: `${tokenB?.displaySymbol}` })}
        rhs={{
          value: tokenB.reserve,
          testID: 'pooled_b',
          suffixType: 'text',
          suffix: tokenB.displaySymbol
        }}
      />

      <EstimatedFeeInfo
        lhs={translate('screens/ConfirmAddLiq', 'Estimated fee')}
        rhs={{
          value: fee.toFixed(8),
          testID: 'text_fee',
          suffix: 'DFI (UTXO)'
        }}
      />

      <SubmitButtonGroup
        isDisabled={isSubmitting || hasPendingJob || hasPendingBroadcastJob}
        label={translate('screens/ConfirmAddLiq', 'ADD')}
        isSubmitting={isSubmitting || hasPendingJob || hasPendingBroadcastJob}
        submittingLabel={translate('screens/ConfirmAddLiq', 'ADDING')}
        onCancel={onCancel}
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
