import { CTransactionSegWit, TransactionSegWit } from '@defichain/jellyfish-transaction/dist'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { NavigationProp, StackActions, useNavigation } from '@react-navigation/native'
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
import { RootState } from '../../../../../store'
import { hasTxQueued, transactionQueue } from '../../../../../store/transaction_queue'
import { tailwind } from '../../../../../tailwind'
import { translate } from '../../../../../translations'
import { BalanceParamList } from '../BalancesNavigator'
import { ConversionMode } from './ConvertScreen'

type Props = StackScreenProps<BalanceParamList, 'ConvertConfirmationScreen'>

export function ConvertConfirmationScreen ({ route }: Props): JSX.Element {
  const { sourceUnit, sourceBalance, targetUnit, targetBalance, mode, amount, fee } = route.params
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
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
    if (hasPendingJob) {
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
    <ScrollView style={tailwind('bg-gray-100 pb-4')}>
      <View style={tailwind('flex-col bg-white px-4 py-8 mb-4 justify-center items-center border-b border-gray-300')}>
        <Text style={tailwind('text-xs text-gray-500')}>
          {translate('screens/ConvertConfirmationScreen', 'YOU ARE CONVERTING')}
        </Text>
        <NumberFormat
          value={amount.toFixed(8)} decimalScale={8} thousandSeparator displayType='text'
          suffix={` ${mode === 'utxosToAccount' ? 'DFI (UTXO)' : 'DFI (Token)'}`}
          renderText={(value) => (
            <Text
              testID='text_convert_amount'
              style={tailwind('text-2xl font-bold flex-wrap text-center')}
            >{value}
            </Text>
          )}
        />
      </View>
      <SectionTitle
        text={translate('screens/ConvertConfirmationScreen', 'AFTER CONVERSION, YOU WILL HAVE:')}
        testID='title_conversion_detail'
      />
      <DFIBalanceRow
        unit={sourceUnit}
        lhs={translate('screens/ConvertConfirmationScreen', sourceUnit)}
        rhs={{ value: sourceBalance.toFixed(8), testID: 'source_amount' }}
      />
      <DFIBalanceRow
        unit={targetUnit}
        lhs={translate('screens/ConvertConfirmationScreen', targetUnit)}
        rhs={{ value: targetBalance.toFixed(8), testID: 'target_amount' }}
      />
      <NumberRow
        lhs={translate('screens/ConvertConfirmationScreen', 'Estimated fee')}
        rhs={{ value: fee.toFixed(8), suffix: ' DFI (UTXO)', testID: 'text_fee' }}
      />
      <Button
        testID='button_confirm_convert'
        disabled={isSubmitting || hasPendingJob}
        label={translate('screens/SendConfirmationScreen', 'CONVERT')}
        title='CONVERT' onPress={onSubmit}
      />
      <Button
        testID='button_cancel_convert'
        disabled={isSubmitting || hasPendingJob}
        label={translate('screens/SendConfirmationScreen', 'CANCEL')}
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

function DFIBalanceRow (props: { lhs: string, rhs: { value: string | number, testID: string }, unit: string }): JSX.Element {
  const iconType = props.unit === 'UTXO' ? '_UTXO' : 'DFI'
  const DFIIcon = getTokenIcon(iconType)
  return (
    <View style={tailwind('bg-white p-4 border-b border-gray-200 flex-row items-start w-full')}>
      <View style={tailwind('flex-1 flex-row')}>
        <DFIIcon width={24} height={24} style={tailwind('mr-2')} />
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
      title: `${translate('screens/ConvertScreen', 'Converting DFI')}`,
      description: `${translate('screens/ConvertScreen', `Converting ${amount.toFixed(8)} ${mode === 'utxosToAccount' ? 'UTXO to Token' : 'Token to UTXO'}`)}`,
      postAction
    }))
  } catch (e) {
    Logging.error(e)
  }
}
