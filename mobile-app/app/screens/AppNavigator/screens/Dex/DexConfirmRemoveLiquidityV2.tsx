import { CTransactionSegWit } from '@defichain/jellyfish-transaction'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { View } from 'react-native'
import BigNumber from 'bignumber.js'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Dispatch } from 'redux'
import { SubmitButtonGroupV2 } from '@components/SubmitButtonGroupV2'
import { ThemedScrollViewV2, ThemedViewV2 } from '@components/themed'
import { RootState } from '@store'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { hasTxQueued, transactionQueue } from '@store/transaction_queue'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { DexParamList } from './DexNavigator'
import { onTransactionBroadcast } from '@api/transaction/transaction_commands'
import { useAppDispatch } from '@hooks/useAppDispatch'
import { SummaryTitleV2 } from '@components/SummaryTitleV2'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useAddressLabel } from '@hooks/useAddressLabel'
import { NumberRowV2 } from '@components/NumberRowV2'
import { useTokenPrice } from '../Portfolio/hooks/TokenPrice'

type Props = StackScreenProps<DexParamList, 'ConfirmRemoveLiquidity'>

export function RemoveLiquidityConfirmScreenV2 ({ route }: Props): JSX.Element {
  const {
    pair,
    pairInfo,
    amount,
    fee,
    tokenAAmount,
    tokenBAmount
  } = route.params
  const dispatch = useAppDispatch()
  const { getTokenPrice } = useTokenPrice()
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigation = useNavigation<NavigationProp<DexParamList>>()
  const [isOnPage, setIsOnPage] = useState<boolean>(true)
  const { address } = useWalletContext()
  const addressLabel = useAddressLabel(address)

  const sharesUsdAmount = getTokenPrice(pair.symbol, new BigNumber(amount), true)
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
    await constructSignedRemoveLiqAndSend(pair, amount, dispatch, () => {
      onTransactionBroadcast(isOnPage, navigation.dispatch)
    })
    setIsSubmitting(false)
  }

  function onCancel (): void {
    if (!isSubmitting) {
      navigation.navigate({
        name: 'RemoveLiquidity',
        params: { pair, pairInfo },
        merge: true
      })
    }
  }

  const resultingPool = Number(pairInfo.amount) - Number(amount)
  return (
    <ThemedScrollViewV2 style={tailwind('py-8 px-5')}>
      <ThemedViewV2
        dark={tailwind('bg-mono-dark-v2-100')}
        light={tailwind('bg-mono-light-v2-100')}
        style={tailwind('flex-col px-4 py-8 mb-4')}
      >
        <SummaryTitleV2
          iconA={pair.tokenA.displaySymbol}
          iconB={pair.tokenB.displaySymbol}
          fromAddress={address}
          amount={amount}
          testID='text_remove_liquidity_amount'
          title={translate('screens/ConfirmRemoveLiquidity', 'You are removing LP tokens')}
          fromAddressLabel={addressLabel}
        />
      </ThemedViewV2>

      <ThemedViewV2
        dark={tailwind('bg-mono-dark-v2-100 border-t-0.5 border-gray-700')}
        light={tailwind('bg-mono-light-v2-100 border-t-0.5 border-gray-300')}
        style={tailwind('py-5')}
      >
        <View style={tailwind('mb-5')}>
          <NumberRowV2
            lhs={{
              value: translate('screens/ConfirmRemoveLiquidity', 'Transaction fee'),
              themedProps: {
                light: tailwind('text-mono-light-v2-700'),
                dark: tailwind('text-mono-dark-v2-700')
              },
              testID: 'transaction_fee_title'
            }}
            rhs={{
              value: fee.toFixed(8),
              suffix: 'DFI',
              testID: 'transaction_fee_title_amount'
            }}
            testID='transaction_fee'
          />
        </View>
        <NumberRowV2
          lhs={{
            value: translate('screens/ConfirmRemoveLiquidity', 'Resulting pool share'),
            themedProps: {
              light: tailwind('text-mono-light-v2-700'),
              dark: tailwind('text-mono-dark-v2-700')
            },
            testID: 'resulting_pool_share_title'
          }}
          rhs={{
            value: new BigNumber(resultingPool).toFixed(8),
            testID: 'resulting_pool_share_amount'
          }}
          testID='resulting_pool_share'
        />
      </ThemedViewV2>

      <ThemedViewV2
        dark={tailwind('bg-mono-dark-v2-100 border-t-0.5 border-b-0.5 border-gray-700')}
        light={tailwind('bg-mono-light-v2-100 border-t-0.5 border-b-0.5 border-gray-300')}
        style={tailwind('py-5')}
      >
        <NumberRowV2
          lhs={{
            value: translate('screens/RemoveLiquidity', '{{token}} to receive', {
              token: pair.tokenA.displaySymbol
            }),
            themedProps: {
              light: tailwind('text-mono-light-v2-700'),
              dark: tailwind('text-mono-dark-v2-700')
            },
            testID: `${pair.tokenA.symbol}_to_receive_title`
          }}
          rhs={{
            value: BigNumber.max(tokenAAmount, 0).toFixed(8),
            testID: `${pair.tokenA.symbol}_to_receive_value`,
            usdAmount: getTokenPrice(pair.tokenA.symbol, new BigNumber(tokenAAmount)),
            usdTextStyle: tailwind('text-sm')
          }}
          testID={`${pair.tokenA.symbol}_to_receive`}
        />

        <NumberRowV2
          lhs={{
            value: translate('screens/RemoveLiquidity', '{{token}} to receive', {
              token: pair.tokenB.displaySymbol
            }),
            themedProps: {
              light: tailwind('text-mono-light-v2-700'),
              dark: tailwind('text-mono-dark-v2-700')
            },
            testID: `${pair.tokenB.symbol}_to_receive_title`
          }}
          rhs={{
            value: BigNumber.max(tokenBAmount, 0).toFixed(8),
            testID: `${pair.tokenB.symbol}_to_receive_value`,
            usdAmount: getTokenPrice(pair.tokenB.symbol, new BigNumber(tokenBAmount)),
            usdTextStyle: tailwind('text-sm')
          }}
          testID={`${pair.tokenB.symbol}_to_receive`}
        />

        <NumberRowV2
          lhs={{
            value: translate('screens/ConfirmRemoveLiquidity', 'LP tokens to remove'),
            themedProps: {
              light: tailwind('text-mono-light-v2-700'),
              dark: tailwind('text-mono-dark-v2-700')
            },
            testID: 'lp_tokens_to_remove_title'
          }}
          rhs={{
            value: new BigNumber(amount).toFixed(8),
            testID: 'lp_tokens_to_remove_amount',
            usdAmount: sharesUsdAmount.isNaN() ? new BigNumber(0) : sharesUsdAmount,
            usdTextStyle: tailwind('text-sm')
          }}
          testID='lp_tokens_to_remove'
        />
      </ThemedViewV2>
      <View style={tailwind('py-14')}>
        <SubmitButtonGroupV2
          isDisabled={isSubmitting || hasPendingJob || hasPendingBroadcastJob}
          label={translate('screens/ConfirmRemoveLiquidity', 'REMOVE')}
          isProcessing={isSubmitting || hasPendingJob || hasPendingBroadcastJob}
          processingLabel={translate('screens/ConfirmRemoveLiquidity', 'REMOVING')}
          onSubmit={onSubmit}
          onCancel={onCancel}
          displayCancelBtn
          title='remove'
        />
      </View>
    </ThemedScrollViewV2>
  )
}

async function constructSignedRemoveLiqAndSend (pair: PoolPairData, amount: BigNumber, dispatch: Dispatch<any>, onBroadcast: () => void): Promise<void> {
  const tokenId = Number(pair.id)
  const symbol = (pair?.tokenA != null && pair?.tokenB != null)
    ? `${pair.tokenA.displaySymbol}-${pair.tokenB.displaySymbol}`
    : pair.symbol

  const signer = async (account: WhaleWalletAccount): Promise<CTransactionSegWit> => {
    const builder = account.withTransactionBuilder()
    const script = await account.getScript()

    const removeLiq = {
      script,
      tokenId,
      amount
    }
    const dfTx = await builder.liqPool.removeLiquidity(removeLiq, script)
    return new CTransactionSegWit(dfTx)
  }

  dispatch(transactionQueue.actions.push({
    sign: signer,
    title: translate('screens/RemoveLiquidity', 'Removing Liquidity'),
    description: translate('screens/RemoveLiquidity', 'Removing {{amount}} {{symbol}}', {
      symbol: symbol,
      amount: amount.toFixed(8)
    }),
    onBroadcast
  }))
}
