import { CTransactionSegWit, TransactionSegWit } from '@defichain/jellyfish-transaction'
import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { NavigationProp, StackActions, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import { useState, useEffect } from 'react'
import { TouchableOpacity, ScrollView, ViewStyle, StyleProp } from 'react-native'
import tailwind from 'tailwind-rn'
import { Text, TextInput, View } from '../../../../components'
import { PrimaryColor, PrimaryColorStyle } from '../../../../constants/Theme'
import { useTokensAPI } from '../../../../hooks/wallet/TokensAPI'
import { BalanceParamList } from './BalancesNavigator'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { MaterialIcons } from '@expo/vector-icons'
import { PrimaryButton } from '../../../../components/PrimaryButton'
import { translate } from '../../../../translations'
import NumberFormat from 'react-number-format'
import { useWhaleApiClient } from '../../../../contexts/WhaleContext'
import { useWallet } from '../../../../contexts/WalletContext'
import LoadingScreen from '../../../LoadingNavigator/LoadingScreen'
import { getTokenIcon } from '../../../../components/icons/tokens/_index'

export type ConversionMode = 'utxosToAccount' | 'accountToUtxos'
type Props = StackScreenProps<BalanceParamList, 'ConvertScreen'>

interface ConversionIO extends AddressToken {
  unit: 'UTXOS' | 'TOKEN'
}

export function ConvertScreen (props: Props): JSX.Element {
  const navigation = useNavigation<NavigationProp<BalanceParamList>>()

  const tokens = useTokensAPI()
  const [mode, setMode] = useState(props.route.params.mode)
  const [sourceToken, setSourceToken] = useState<ConversionIO>()
  const [targetToken, setTargetToken] = useState<ConversionIO>()

  const [amount, setAmount] = useState<string>('0')

  const whaleApiClient = useWhaleApiClient()
  const account = useWallet().get(0)

  useEffect(() => {
    const [source, target] = getDFIBalances(mode, tokens)
    setSourceToken(source)
    setTargetToken(target)
    console.log('use effect', mode)
  }, [mode])

  if (sourceToken === undefined || targetToken === undefined) {
    return <LoadingScreen />
  }

  // to display (prevent NaN)
  const convAmount = new BigNumber(amount).isNaN() ? '0' : new BigNumber(amount).toString()

  const convert = (): void => {
    constructSignedConversionAndSend(
      whaleApiClient,
      account,
      props.route.params.mode,
      new BigNumber(amount)
    ).then(() => {
      navigation.dispatch(StackActions.popToTop())
    }).catch(e => console.log(e)) // TODO: display error
  }

  return (
    <View style={tailwind('w-full h-full')}>
      <ScrollView style={tailwind('w-full flex-col flex-1 bg-gray-100')}>
        <ConversionIOCard
          style={tailwind('mt-4')}
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
      </ScrollView>
      <SectionTitle title={translate('screens/ConvertScreen', 'PREVIEW CONVERSION')} />
      <View style={tailwind('bg-white flex-col justify-center')}>
        <PreviewConvResult testID='text_preview_input' unit={sourceToken.unit} balance={new BigNumber(sourceToken.amount).minus(convAmount)} />
        <PreviewConvResult testID='text_preview_output' unit={targetToken.unit} balance={new BigNumber(targetToken.amount).plus(convAmount)} />
        <PrimaryButton
          testID='button_continue_convert'
          disabled={!canConvert(convAmount, sourceToken.amount)}
          title='Convert' onPress={convert}
          touchableStyle={tailwind('mt-0')}
        >
          <Text style={tailwind('text-white font-bold')}>{translate('components/Button', 'CONTINUE')}</Text>
        </PrimaryButton>
      </View>
    </View>
  )
}

function getDFIBalances (mode: ConversionMode, tokens: AddressToken[]): [source: ConversionIO, target: ConversionIO] {
  const source: AddressToken = mode === 'utxosToAccount'
    ? tokens.find(tk => tk.id === '0_utxo') as AddressToken
    : tokens.find(tk => tk.id === '0') as AddressToken
  const sourceUnit = mode === 'utxosToAccount' ? 'UTXOS' : 'TOKEN'

  const target: AddressToken = mode === 'utxosToAccount'
    ? tokens.find(tk => tk.id === '0') as AddressToken
    : tokens.find(tk => tk.id === '0_utxo') as AddressToken
  const targetUnit = mode === 'utxosToAccount' ? 'TOKEN' : 'UTXOS'

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
        <Text style={[PrimaryColorStyle.text]}>{translate('components/max', 'MAX')}</Text>
      </TouchableOpacity>
    )
  }
  return (
    <View style={[tailwind('flex-col w-full h-30 items-center'), props.style]}>
      <SectionTitle title={title} />
      <View style={tailwind('flex-row w-full h-10 bg-white items-center pl-4 pr-4')}>
        <TextInput
          testID={`text_input_convert_from_${props.mode}`}
          value={props.current}
          style={tailwind('flex-1 mr-4 text-gray-500')}
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
      <View style={tailwind('w-full bg-white flex-row border-t border-gray-200 h-12 items-center')}>
        <View style={tailwind('flex flex-row flex-1 ml-4')}>
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
      <MaterialIcons name='swap-vert' size={24} color={PrimaryColor} />
    </TouchableOpacity>
  )
}

function TokenVsUtxosInfo (): JSX.Element {
  return (
    <TouchableOpacity style={tailwind('flex-row p-4 items-center justify-center')} onPress={() => { /* TODO: token vs utxo explanation UI */ }}>
      <MaterialIcons name='info' size={24} color='gray' />
      <Text style={tailwind('ml-2')}>{translate('screens/ConvertScreen', "Tokens vs UTXO, what's the difference?")}</Text>
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
    <View style={tailwind('flex-col w-full h-8 justify-center')}>
      <Text style={tailwind('ml-4 mr-4 text-gray-500 text-sm')}>{props.title}</Text>
    </View>
  )
}

function canConvert (amount: string, balance: string): boolean {
  return new BigNumber(balance).gte(amount) && !(new BigNumber(amount).isZero())
}

async function constructSignedConversionAndSend (whaleAPI: WhaleApiClient, account: WhaleWalletAccount, mode: ConversionMode, amount: BigNumber): Promise<string> {
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

  const hex = new CTransactionSegWit(signed).toHex()
  return await whaleAPI.transactions.send({ hex })
}
