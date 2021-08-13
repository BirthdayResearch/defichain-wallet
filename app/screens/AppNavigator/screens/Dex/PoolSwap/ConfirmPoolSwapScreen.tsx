import { CTransactionSegWit, PoolSwap } from '@defichain/jellyfish-transaction/dist'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { StackActions, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import React, { Dispatch, useEffect, useState } from 'react'
import { ScrollView, View } from 'react-native'
import NumberFormat from 'react-number-format'
import { useDispatch, useSelector } from 'react-redux'
import { Logging } from '../../../../../api'
import { Text } from '../../../../../components'
import { Button } from '../../../../../components/Button'
import { getTokenIcon } from '../../../../../components/icons/tokens/_index'
import { SectionTitle } from '../../../../../components/SectionTitle'
import { useWalletContext } from '../../../../../contexts/WalletContext'
import { RootState } from '../../../../../store'
import { hasTxQueued, transactionQueue } from '../../../../../store/transaction_queue'
import { tailwind } from '../../../../../tailwind'
import { translate } from '../../../../../translations'
import { DexParamList } from '../DexNavigator'
import { DerivedTokenState } from './PoolSwapScreen'

type Props = StackScreenProps<DexParamList, 'ConfirmPoolSwapScreen'>

export function ConfirmPoolSwapScreen ({ route }: Props): JSX.Element {
  const {
    tokenA,
    tokenB,
    fee,
    swap
  } = route.params
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const dispatch = useDispatch()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigation = useNavigation()
  const [isOnPage, setIsOnPage] = useState<boolean>(true)
  const { account } = useWalletContext()
  const postAction = (): void => {
    if (isOnPage) {
      navigation.dispatch(StackActions.popToTop())
    }
  }

  useEffect(() => {
    setIsOnPage(true)
    return () => {
      setIsOnPage(false)
    }
  }, [])

  async function onSubmit (): Promise<void> {
    if (hasPendingJob) {
      return
    }
    setIsSubmitting(true)
    await constructSignedSwapAndSend(account, swap, dispatch, postAction)
    setIsSubmitting(false)
  }

  function onCancel (): void {
    if (!isSubmitting) {
      navigation.navigate('PoolSwap')
    }
  }

  return (
    <ScrollView style={tailwind('bg-gray-100 pb-4')}>
      <View style={tailwind('flex-col bg-white px-4 py-8 mb-4 justify-center items-center border-b border-gray-300')}>
        <Text style={tailwind('text-xs text-gray-500')}>
          {translate('screens/PoolSwapConfirmScreen', 'YOU ARE SWAPPING')}
        </Text>
        <NumberFormat
          value={swap.fromAmount.toFixed(8)} decimalScale={8} thousandSeparator displayType='text'
          suffix={` ${tokenA.symbol}`}
          renderText={(value) => (
            <Text
              testID='text_swap_amount'
              style={tailwind('text-2xl font-bold flex-wrap text-center')}
            >{value}
            </Text>
          )}
        />
      </View>
      <SectionTitle
        text={translate('screens/PoolSwapConfirmScreen', 'AFTER SWAP, YOU WILL HAVE:')}
        testID='title_swap_detail'
      />
      <TokenBalanceRow
        unit={tokenA.symbol}
        lhs={tokenA.symbol}
        rhs={{
          value: BigNumber.max(new BigNumber(tokenA.amount).minus(swap.fromAmount), 0).toFixed(8),
          testID: 'source_amount'
        }}
      />
      <TokenBalanceRow
        unit={tokenB.symbol}
        lhs={tokenB.symbol}
        rhs={{
          value: BigNumber.max(new BigNumber(tokenB.amount).plus(swap.toAmount), 0).toFixed(8),
          testID: 'target_amount'
        }}
      />
      <NumberRow
        lhs={translate('screens/PoolSwapConfirmScreen', 'Estimated fee')}
        rhs={{ value: fee.toFixed(8), suffix: ' DFI (UTXO)', testID: 'text_fee' }}
      />
      <Button
        testID='button_confirm_swap'
        disabled={isSubmitting || hasPendingJob}
        label={translate('screens/PoolSwapConfirmScreen', 'SWAP')}
        title='Swap' onPress={onSubmit}
      />
      <Button
        testID='button_cancel_swap'
        disabled={isSubmitting || hasPendingJob}
        label={translate('screens/PoolSwapConfirmScreen', 'CANCEL')}
        title='CANCEL' onPress={onCancel}
        fill='flat'
        margin='m-4 mt-0'
      />
    </ScrollView>
  )
}

function NumberRow (props: { lhs: string, rhs: { value: string | number, suffix?: string, testID: string } }): JSX.Element {
  return (
    <View style={tailwind('bg-white p-4 border-b border-gray-200 flex-row items-start w-full')}>
      <View style={tailwind('flex-1')}>
        <Text style={tailwind('font-medium')}>{props.lhs}</Text>
      </View>
      <View style={tailwind('flex-1')}>
        <NumberFormat
          value={props.rhs.value} decimalScale={8} thousandSeparator displayType='text'
          suffix={props.rhs.suffix}
          renderText={(val: string) => (
            <Text
              testID={props.rhs.testID}
              style={tailwind('flex-wrap font-medium text-right text-gray-500')}
            >{val}
            </Text>
          )}
        />
      </View>
    </View>
  )
}

function TokenBalanceRow (props: { lhs: string, rhs: { value: string | number, testID: string }, unit: string }): JSX.Element {
  const TokenIcon = getTokenIcon(props.unit)
  return (
    <View style={tailwind('bg-white p-4 border-b border-gray-200 flex-row items-start w-full')}>
      <View style={tailwind('flex-1 flex-row')}>
        <TokenIcon width={24} height={24} style={tailwind('mr-2')} />
        <Text style={tailwind('font-medium')} testID={`${props.rhs.testID}_unit`}>{props.lhs}</Text>
      </View>
      <View style={tailwind('flex-1')}>
        <NumberFormat
          value={props.rhs.value} decimalScale={8} thousandSeparator displayType='text'
          renderText={(val: string) => (
            <Text
              testID={props.rhs.testID}
              style={tailwind('flex-wrap font-medium text-right text-gray-500')}
            >{val}
            </Text>
          )}
        />
      </View>
    </View>
  )
}

export interface DexForm {
  fromToken: DerivedTokenState
  toToken: DerivedTokenState
  fromAmount: BigNumber
  toAmount: BigNumber
}

async function constructSignedSwapAndSend (
  account: WhaleWalletAccount, // must be both owner and recipient for simplicity
  dexForm: DexForm,
  dispatch: Dispatch<any>,
  postAction: () => void
): Promise<void> {
  try {
    const maxPrice = dexForm.fromAmount.div(dexForm.toAmount).decimalPlaces(8)
    const signer = async (): Promise<CTransactionSegWit> => {
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
      title: `${translate('screens/PoolSwapScreen', 'Swapping Token')}`,
      description: `${translate('screens/PoolSwapScreen', `Swapping ${dexForm.fromAmount.toFixed(8)} ${dexForm.fromToken.symbol} to ${dexForm.toAmount.toFixed(8)} ${dexForm.toToken.symbol}`)}`,
      postAction
    }))
  } catch (e) {
    Logging.error(e)
  }
}
