import { CTransactionSegWit, TransactionSegWit } from '@defichain/jellyfish-transaction'
import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { MaterialIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { ScrollView, StyleProp, TouchableOpacity, ViewStyle } from 'react-native'
import NumberFormat from 'react-number-format'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch } from 'redux'
import { Logging } from '../../../../api'
import { Text, TextInput, View } from '../../../../components'
import { Button } from '../../../../components/Button'
import { getTokenIcon } from '../../../../components/icons/tokens/_index'
import LoadingScreen from '../../../../components/LoadingScreen'
import { SectionTitle } from '../../../../components/SectionTitle'
import { AmountButtonTypes, SetAmountButton } from '../../../../components/SetAmountButton'
import { useTokensAPI } from '../../../../hooks/wallet/TokensAPI'
import { RootState } from '../../../../store'
import { hasTxQueued, transactionQueue } from '../../../../store/transaction'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'
import { BalanceParamList } from './BalancesNavigator'

export type ConversionMode = 'utxosToAccount' | 'accountToUtxos'
type Props = StackScreenProps<BalanceParamList, 'ConvertScreen'>

interface ConversionIO extends AddressToken {
  unit: 'UTXO' | 'TOKEN'
}

export function ConvertScreen (props: Props): JSX.Element {
  const dispatch = useDispatch()
  // global state
  const tokens = useTokensAPI()
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))

  const [mode, setMode] = useState(props.route.params.mode)
  const [sourceToken, setSourceToken] = useState<ConversionIO>()
  const [targetToken, setTargetToken] = useState<ConversionIO>()

  const [amount, setAmount] = useState<string>('0')

  useEffect(() => {
    const [source, target] = getDFIBalances(mode, tokens)
    setSourceToken(source)
    setTargetToken(target)
  }, [mode, JSON.stringify(tokens)])

  if (sourceToken === undefined || targetToken === undefined) {
    return <LoadingScreen />
  }

  // to display (prevent NaN)
  const convAmount = new BigNumber(amount).isNaN() ? '0' : new BigNumber(amount).toString()

  const convert = (): void => {
    if (hasPendingJob) return
    constructSignedConversionAndSend(
      props.route.params.mode,
      new BigNumber(amount),
      dispatch
    ).catch(e => {
      Logging.error(e)
    })
  }

  return (
    <ScrollView style={tailwind('w-full flex-col flex-1 bg-gray-100')}>
      <ConversionIOCard
        style={tailwind('my-4 mt-1')}
        mode='input'
        current={amount}
        unit={sourceToken.unit}
        balance={new BigNumber(sourceToken.amount)}
        onChange={setAmount}
      />
      <ToggleModeButton onPress={() => setMode(mode === 'utxosToAccount' ? 'accountToUtxos' : 'utxosToAccount')} />
      <ConversionIOCard
        mode='output'
        current={convAmount}
        unit={targetToken.unit}
        balance={new BigNumber(targetToken.amount)}
      />
      <TokenVsUtxosInfo />
      <SectionTitle
        testID='preview_conversion'
        text={translate('screens/ConvertScreen', 'AFTER CONVERSION, YOU WILL HAVE:')}
      />
      <View style={tailwind('bg-white flex-col justify-center')}>
        <PreviewConvResult
          testID='text_preview_input' unit={sourceToken.unit}
          balance={BigNumber.maximum(new BigNumber(sourceToken.amount).minus(convAmount), 0)}
        />
        <PreviewConvResult
          testID='text_preview_output' unit={targetToken.unit}
          balance={BigNumber.maximum(new BigNumber(targetToken.amount).plus(convAmount), 0)}
        />
        <Button
          testID='button_continue_convert'
          margin='m-4 mt-3'
          disabled={!canConvert(convAmount, sourceToken.amount) || hasPendingJob}
          title='Convert' onPress={convert} label={translate('components/Button', 'CONTINUE')}
        />
      </View>
    </ScrollView>
  )
}

function getDFIBalances (mode: ConversionMode, tokens: AddressToken[]): [source: ConversionIO, target: ConversionIO] {
  const source: AddressToken = mode === 'utxosToAccount'
    ? tokens.find(tk => tk.id === '0_utxo') as AddressToken
    : tokens.find(tk => tk.id === '0') as AddressToken
  const sourceUnit = mode === 'utxosToAccount' ? 'UTXO' : 'TOKEN'

  const target: AddressToken = mode === 'utxosToAccount'
    ? tokens.find(tk => tk.id === '0') as AddressToken
    : tokens.find(tk => tk.id === '0_utxo') as AddressToken
  const targetUnit = mode === 'utxosToAccount' ? 'TOKEN' : 'UTXO'

  return [
    { ...source, unit: sourceUnit },
    { ...target, unit: targetUnit }
  ]
}

function ConversionIOCard (props: { style?: StyleProp<ViewStyle>, mode: 'input' | 'output', unit: string, current: string, balance: BigNumber, onChange?: (amount: string) => void }): JSX.Element {
  const iconType = props.unit === 'UTXO' ? '_UTXO' : 'DFI'
  const titlePrefix = props.mode === 'input' ? 'CONVERT' : 'TO'
  const title = `${translate('screens/Convert', titlePrefix)} ${props.unit}`
  const DFIIcon = getTokenIcon(iconType)

  return (
    <View style={[tailwind('flex-col w-full'), props.style]}>
      <SectionTitle text={title} testID={`text_input_convert_from_${props.mode}_text`} />
      <View style={tailwind('flex-row w-full bg-white items-center pl-4 pr-4')}>
        <TextInput
          testID={`text_input_convert_from_${props.mode}`}
          value={props.current}
          style={tailwind('flex-1 mr-4 text-gray-500 px-1 py-4')}
          keyboardType='numeric'
          editable={props.mode === 'input'}
          onChange={event => {
            if (props.onChange !== undefined) {
              props.onChange(event.nativeEvent.text)
            }
          }}
        />
        <DFIIcon width={24} height={24} />
      </View>
      <View style={tailwind('w-full px-4 bg-white flex-row border-t border-gray-200 items-center')}>
        <View style={tailwind('flex flex-row flex-1 px-1 py-4')}>
          <Text>{translate('screens/Convert', 'Balance')}: </Text>
          <NumberFormat
            value={props.balance.toNumber()} decimalScale={8} thousandSeparator displayType='text' suffix=' DFI'
            renderText={(value: string) => <Text style={tailwind('font-medium text-gray-500')}>{value}</Text>}
          />
        </View>
        {props.mode === 'input' && props.onChange &&
          <SetAmountButton type={AmountButtonTypes.half} onPress={props.onChange} amount={props.balance} />}
        {props.mode === 'input' && props.onChange &&
          <SetAmountButton type={AmountButtonTypes.max} onPress={props.onChange} amount={props.balance} />}
      </View>
    </View>
  )
}

function ToggleModeButton (props: { onPress: () => void }): JSX.Element {
  return (
    <TouchableOpacity
      testID='button_convert_mode_toggle'
      style={tailwind('w-full justify-center items-center p-2')}
      onPress={props.onPress}
    >
      <MaterialIcons name='swap-vert' size={24} style={tailwind('text-primary')} />
    </TouchableOpacity>
  )
}

function TokenVsUtxosInfo (): JSX.Element {
  const navigation = useNavigation()
  return (
    <TouchableOpacity
      style={tailwind('flex-row px-4 py-2 my-2 items-center justify-start')}
      onPress={() => {
        navigation.navigate('TokensVsUtxo')
      }}
      testID='token_vs_utxo_info'
    >
      <MaterialIcons name='help' size={16} style={tailwind('text-primary')} />
      <Text
        style={tailwind('ml-1 text-primary text-sm font-medium')}
      >{translate('screens/ConvertScreen', "Token vs UTXO, what's the difference?")}
      </Text>
    </TouchableOpacity>
  )
}

/**
 * footer, UTXOS or Token DFI balance preview AFTER conversion
 */
function PreviewConvResult (props: { unit: string, balance: BigNumber, testID: string }): JSX.Element {
  const iconType = props.unit === 'UTXO' ? '_UTXO' : 'DFI'
  const DFIIcon = getTokenIcon(iconType)
  return (
    <View style={tailwind(`flex-row p-4 items-center ${iconType === '_UTXO' ? 'border-b border-gray-200' : ''}`)}>
      <DFIIcon width={24} height={24} style={tailwind('mr-2')} />
      <Text testID={`${props.testID}_desc`} style={tailwind('flex-1')}>DFI ({props.unit})</Text>
      <NumberFormat
        value={props.balance.toNumber()} decimalScale={8} thousandSeparator displayType='text' suffix=' DFI'
        renderText={(value: string) => (
          <Text
            testID={`${props.testID}_value`}
            style={tailwind('font-medium text-gray-500')}
          >{value}
          </Text>
        )}
      />
    </View>
  )
}

function canConvert (amount: string, balance: string): boolean {
  return new BigNumber(balance).gte(amount) && !(new BigNumber(amount).isZero()) && (new BigNumber(amount).isPositive())
}

async function constructSignedConversionAndSend (mode: ConversionMode, amount: BigNumber, dispatch: Dispatch<any>): Promise<void> {
  const signer = async (account: WhaleWalletAccount): Promise<CTransactionSegWit> => {
    const builder = account.withTransactionBuilder()
    const script = await account.getScript()
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
    title: `${translate('screens/ConvertScreen', 'Converting DFI')}`
  }))
}
