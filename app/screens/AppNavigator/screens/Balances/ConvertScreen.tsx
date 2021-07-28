import { CTransactionSegWit, TransactionSegWit } from '@defichain/jellyfish-transaction'
import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { MaterialIcons } from '@expo/vector-icons'
import { StackScreenProps } from '@react-navigation/stack'
import { NavigationProp } from '@react-navigation/native'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { ScrollView, StyleProp, TouchableOpacity, ViewStyle } from 'react-native'
import NumberFormat from 'react-number-format'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch } from 'redux'
import { Logging } from '../../../../api/logging'
import { Text, TextInput, View } from '../../../../components'
import { Button } from '../../../../components/Button'
import { getTokenIcon } from '../../../../components/icons/tokens/_index'
import { useTokensAPI } from '../../../../hooks/wallet/TokensAPI'
import { RootState } from '../../../../store'
import { hasTxQueued, ocean } from '../../../../store/ocean'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'
import LoadingScreen from '../../../LoadingNavigator/LoadingScreen'
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
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.ocean))

  const [mode, setMode] = useState(props.route.params.mode)
  const [sourceToken, setSourceToken] = useState<ConversionIO>()
  const [targetToken, setTargetToken] = useState<ConversionIO>()

  const [amount, setAmount] = useState<string>('0')

  useEffect(() => {
    const [source, target] = getDFIBalances(mode, tokens)
    setSourceToken(source)
    setTargetToken(target)
  }, [mode])

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
      dispatch(ocean.actions.setError(e))
    })
  }

  return (
    <ScrollView style={tailwind('w-full flex-col flex-1 bg-gray-100')}>
      <ConversionIOCard
        style={tailwind('my-4')}
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
      <TokenVsUtxosInfo navigation={props.navigation} />
      <SectionTitle title={translate('screens/ConvertScreen', 'PREVIEW CONVERSION')} />
      <View style={tailwind('bg-white flex-col justify-center')}>
        <PreviewConvResult
          testID='text_preview_input' unit={sourceToken.unit}
          balance={new BigNumber(sourceToken.amount).minus(convAmount)}
        />
        <PreviewConvResult
          testID='text_preview_output' unit={targetToken.unit}
          balance={new BigNumber(targetToken.amount).plus(convAmount)}
        />
        <View style={tailwind('mt-4')}>
          <Button
            testID='button_continue_convert'
            disabled={!canConvert(convAmount, sourceToken.amount) || hasPendingJob}
            title='Convert' onPress={convert} label={translate('components/Button', 'CONTINUE')}
          />
        </View>
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
  const iconType = props.unit === 'UTXOS' ? '_UTXO' : 'DFI'
  const titlePrefix = props.mode === 'input' ? 'CONVERT' : 'TO'
  const title = `${translate('screens/Convert', titlePrefix)} ${props.unit}`

  const DFIIcon = getTokenIcon(iconType)
  const MaxButton = (): JSX.Element | null => {
    if (props.mode === 'output') {
      return null
    }

    return (
      <TouchableOpacity
        testID='button_max_convert_from'
        style={tailwind('flex w-12 mr-2')}
        onPress={() => {
          if (props.onChange !== undefined) {
            props.onChange(props.balance.toString())
          }
        }}
      >
        <Text style={tailwind('text-primary')}>{translate('components/max', 'MAX')}</Text>
      </TouchableOpacity>
    )
  }
  return (
    <View style={[tailwind('flex-col w-full items-center'), props.style]}>
      <SectionTitle title={title} />
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
        <DFIIcon width={24} height={24} style={tailwind('mr-2')} />
        <Text>{props.unit}</Text>
      </View>
      <View style={tailwind('w-full bg-white flex-row border-t border-gray-200 items-center')}>
        <View style={tailwind('flex flex-row flex-1 ml-4 px-1 py-4')}>
          <Text>{translate('screens/Convert', 'Balance')}: </Text>
          <NumberFormat
            value={props.balance.toNumber()} decimalScale={8} thousandSeparator displayType='text' suffix=' DFI'
            renderText={(value: string) => <Text style={tailwind('font-medium text-gray-500')}>{value}</Text>}
          />
        </View>
        {MaxButton()}
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

function TokenVsUtxosInfo (props: { navigation: NavigationProp<BalanceParamList>}): JSX.Element {
  return (
    <TouchableOpacity
      style={tailwind('flex-row p-4 my-3 items-center justify-center')} onPress={() => {
        props.navigation.navigate('TokensVsUtxo')
      }}
    >
      <MaterialIcons name='info' size={24} color='gray' />
      <Text
        style={tailwind('ml-2')}
      >{translate('screens/ConvertScreen', "Tokens vs UTXO, what's the difference?")}
      </Text>
    </TouchableOpacity>
  )
}

/**
 * footer, UTXOS or Token DFI balance preview AFTER conversion
 */
function PreviewConvResult (props: { unit: string, balance: BigNumber, testID: string }): JSX.Element {
  const iconType = props.unit === 'UTXOS' ? '_UTXO' : 'DFI'
  const DFIIcon = getTokenIcon(iconType)
  return (
    <View style={tailwind('flex-row h-12 pl-4 pr-4 items-center')}>
      <DFIIcon width={24} height={24} style={tailwind('mr-2')} />
      <Text testID={`${props.testID}_desc`} style={tailwind('flex-1')}>DFI ({props.unit})</Text>
      <NumberFormat
        value={props.balance.toNumber()} decimalScale={8} thousandSeparator displayType='text' suffix=' DFI'
        renderText={(value: string) => <Text testID={`${props.testID}_value`} style={tailwind('font-medium text-gray-500')}>{value}</Text>}
      />
    </View>
  )
}

function SectionTitle (props: { title: string }): JSX.Element {
  return (
    <View style={tailwind('flex-col w-full h-8 justify-center mb-2')}>
      <Text style={tailwind('ml-4 mr-4 text-gray-500 text-sm')}>{props.title}</Text>
    </View>
  )
}

function canConvert (amount: string, balance: string): boolean {
  return new BigNumber(balance).gte(amount) && !(new BigNumber(amount).isZero())
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

  dispatch(ocean.actions.queueTransaction({
    sign: signer,
    title: `${translate('screens/ConvertScreen', 'Converting DFI')}`
  }))
}
