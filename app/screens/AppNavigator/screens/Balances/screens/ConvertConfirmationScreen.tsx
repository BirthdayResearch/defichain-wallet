import { ThemedScrollView, ThemedSectionTitle } from '@components/themed'
import { CTransactionSegWit, TransactionSegWit } from '@defichain/jellyfish-transaction/dist'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { NavigationProp, StackActions, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import React, { Dispatch, useEffect, useState } from 'react'
import { View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { Logging } from '../../../../../api'
import { NumberRow } from '../../../../../components/NumberRow'
import { SubmitButtonGroup } from '../../../../../components/SubmitButtonGroup'
import { SummaryTitle } from '../../../../../components/SummaryTitle'
import { TokenBalanceRow } from '../../../../../components/TokenBalanceRow'
import { RootState } from '../../../../../store'
import { hasTxQueued as hasBroadcastQueued } from '../../../../../store/ocean'
import { hasTxQueued, transactionQueue } from '../../../../../store/transaction_queue'
import { tailwind } from '../../../../../tailwind'
import { translate } from '../../../../../translations'
import { BalanceParamList } from '../BalancesNavigator'
import { ConversionMode } from './ConvertScreen'

type Props = StackScreenProps<BalanceParamList, 'ConvertConfirmationScreen'>

export function ConvertConfirmationScreen ({ route }: Props): JSX.Element {
  const { sourceUnit, sourceBalance, targetUnit, targetBalance, mode, amount, fee } = route.params
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const dispatch = useDispatch()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigation = useNavigation<NavigationProp<BalanceParamList>>()
  const [isOnPage, setIsOnPage] = useState<boolean>(true)
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
    if (hasPendingJob || hasPendingBroadcastJob) {
      return
    }
    setIsSubmitting(true)
    await constructSignedConversionAndSend({ mode, amount }, dispatch, postAction)
    setIsSubmitting(false)
  }

  function onCancel (): void {
    if (!isSubmitting) {
      navigation.navigate({
        name: 'Convert',
        params: {
          mode
        },
        merge: true
      })
    }
  }

  return (
    <ThemedScrollView style={tailwind('pb-4')}>
      <SummaryTitle
        amount={amount}
        suffix={` ${mode === 'utxosToAccount' ? 'DFI (UTXO)' : 'DFI (Token)'}`}
        testID='text_convert_amount'
        title={translate('screens/ConvertConfirmScreen', 'YOU ARE CONVERTING')}
      />

      <ThemedSectionTitle
        testID='title_conversion_detail'
        text={translate('screens/ConvertConfirmScreen', 'AFTER CONVERSION, YOU WILL HAVE:')}
      />

      <TokenBalanceRow
        iconType={sourceUnit === 'UTXO' ? '_UTXO' : 'DFI'}
        lhs={translate('screens/ConvertConfirmScreen', sourceUnit)}
        rhs={{ value: sourceBalance.toFixed(8), testID: 'source_amount' }}
      />

      <TokenBalanceRow
        iconType={targetUnit === 'UTXO' ? '_UTXO' : 'DFI'}
        lhs={translate('screens/ConvertConfirmScreen', targetUnit)}
        rhs={{ value: targetBalance.toFixed(8), testID: 'target_amount' }}
      />

      <View style={tailwind('mt-4')}>
        <NumberRow
          lhs={translate('screens/ConvertConfirmScreen', 'Estimated fee')}
          rightHandElements={[{ value: fee.toFixed(8), suffix: ' DFI (UTXO)', testID: 'text_fee' }]}
        />
      </View>

      <SubmitButtonGroup
        isDisabled={isSubmitting || hasPendingJob || hasPendingBroadcastJob}
        label={translate('screens/ConvertConfirmScreen', 'CONVERT')}
        onCancel={onCancel}
        onSubmit={onSubmit}
        title='convert'
      />
    </ThemedScrollView>
  )
}

async function constructSignedConversionAndSend ({
  mode,
  amount
}: { mode: ConversionMode, amount: BigNumber }, dispatch: Dispatch<any>, postAction: () => void): Promise<void> {
  try {
    const signer = async (account: WhaleWalletAccount): Promise<CTransactionSegWit> => {
      const script = await account.getScript()
      const builder = account.withTransactionBuilder()
      let signed: TransactionSegWit
      if (mode === 'utxosToAccount') {
        signed = await builder.account.utxosToAccount({
          to: [{
            script,
            balances: [
              { token: 0, amount }
            ]
          }]
        }, script)
      } else {
        signed = await builder.account.accountToUtxos({
          from: script,
          balances: [
            { token: 0, amount }
          ],
          mintingOutputsStart: 2 // 0: DfTx, 1: change, 2: minted utxos (mandated by jellyfish-tx)
        }, script)
      }
      return new CTransactionSegWit(signed)
    }

    dispatch(transactionQueue.actions.push({
      sign: signer,
      title: translate('screens/ConvertConfirmScreen', 'Converting DFI'),
      description: translate('screens/ConvertConfirmScreen', 'Converting {{amount}} {{symbolA}} to {{symbolB}}', {
        amount: amount.toFixed(8),
        ...(mode === 'utxosToAccount' ? { symbolA: 'UTXO', symbolB: 'Token' } : { symbolA: 'Token', symbolB: 'UTXO' })
      }),
      postAction
    }))
  } catch (e) {
    Logging.error(e)
  }
}
