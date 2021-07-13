import { DeFiAddress } from '@defichain/jellyfish-address'
import { CTransactionSegWit, TransactionSegWit } from '@defichain/jellyfish-transaction'
import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { MaterialIcons } from '@expo/vector-icons'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
import { Control, Controller, useForm } from 'react-hook-form'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import NumberFormat from 'react-number-format'
import { useDispatch } from 'react-redux'
import { Dispatch } from 'redux'
import tailwind from 'tailwind-rn'
import { Logging } from '../../../../../api/logging'
import { Wallet } from '../../../../../api/wallet'
import { Text, TextInput } from '../../../../../components'
import { getTokenIcon } from '../../../../../components/icons/tokens/_index'
import { PrimaryButton } from '../../../../../components/PrimaryButton'
import { PrimaryColor, PrimaryColorStyle } from '../../../../../constants/Theme'
import { networkMapper, useNetworkContext } from '../../../../../contexts/NetworkContext'
import { useWallet } from '../../../../../contexts/WalletContext'
import { useWhaleApiClient } from '../../../../../contexts/WhaleContext'
import { EnvironmentNetwork } from '../../../../../environment'
import { networkDrawer } from '../../../../../store/networkDrawer'
import { WalletToken } from '../../../../../store/wallet'
import { translate } from '../../../../../translations'
import { BalanceParamList } from '../BalancesNavigator'

async function send (amount: BigNumber, address: string, wallet: Wallet, network: EnvironmentNetwork, token: AddressToken, dispatch: Dispatch<any>): Promise<void> {
  try {
    const account = wallet.get(0)
    const script = await account.getScript()
    const builder = account.withTransactionBuilder()
    const to = DeFiAddress.from(networkMapper(network), address).getScript()
    let signed: TransactionSegWit
    if (token.symbol === 'DFI') {
      signed = await builder.utxo.send(amount, to, script)
    } else {
      signed = await builder.account.accountToAccount({
        from: script,
        to: [{ script: to, balances: [{ token: +token.id, amount }] }]
      }, script)
    }
    dispatch(networkDrawer.actions.queueTransaction({
      signed: new CTransactionSegWit(signed),
      broadcasted: false,
      title: `${translate('screens/SendScreen', 'Sending')} ${token.symbol}`
    }))
  } catch (e) {
    Logging.error(e)
    dispatch(networkDrawer.actions.setError(e))
  }
}

type Props = StackScreenProps<BalanceParamList, 'SendScreen'>

export function SendScreen ({ route }: Props): JSX.Element {
  const { network } = useNetworkContext()
  const wallet = useWallet()
  const client = useWhaleApiClient()
  const [token] = useState(route.params.token)
  const { control, setValue, formState: { isValid }, getValues, trigger } = useForm({ mode: 'onChange' })
  const dispatch = useDispatch()
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001))
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    client.transactions.estimateFee().then((f) => setFee(new BigNumber(f))).catch((e) => Logging.error(e))
  }, [])

  async function onSubmit (): Promise<void> {
    setIsSubmitting(true)
    if (isValid) {
      const values = getValues()
      await send(new BigNumber(values.amount), values.address, wallet, network, token, dispatch)
    }
    setIsSubmitting(false)
  }

  return (
    <ScrollView style={tailwind('bg-gray-100')}>
      <AddressRow control={control} />
      <AmountRow
        fee={fee}
        token={token} control={control} onMaxPress={async (amount) => {
          setValue('amount', amount)
          await trigger('amount')
        }}
      />
      {
        fee !== undefined && (
          <View style={tailwind('flex-row w-full bg-white p-4 mt-6')}>
            <View style={tailwind('flex-grow')}>
              <Text>{translate('screens/SendScreen', 'Transaction fee')}</Text>
            </View>
            <NumberFormat
              value={fee.toString()} decimalScale={8} thousandSeparator displayType='text' suffix=' DFI'
              renderText={(value) => <Text style={tailwind('text-gray-500')}>{value}</Text>}
            />
          </View>
        )
      }
      <PrimaryButton disabled={!isValid || isSubmitting} title='Send' onPress={onSubmit}>
        <Text style={tailwind('text-white font-bold')}>{translate('screens/SendScreen', 'SEND')}</Text>
      </PrimaryButton>
    </ScrollView>
  )
}

function AddressRow ({ control }: { control: Control }): JSX.Element {
  return (
    <>
      <Text
        style={tailwind('text-sm font-bold pl-4 mt-4 mb-2')}
      >{translate('screens/SendScreen', 'TO ADDRESS')}
      </Text>
      <Controller
        control={control}
        rules={{
          required: true
        }}
        render={({ field: { value, onBlur, onChange } }) => (
          <View style={tailwind('flex-row w-full')}>
            <TextInput
              style={tailwind('flex-grow p-4 bg-white')}
              autoCapitalize='none'
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder={translate('screens/SendScreen', 'Enter an address')}
            />
            <TouchableOpacity
              style={tailwind('p-4 bg-white')}
            >
              <MaterialIcons name='qr-code-scanner' size={24} color={PrimaryColor} />
            </TouchableOpacity>
          </View>
        )}
        name='address'
        defaultValue=''
      />
    </>
  )
}

interface AmountForm {
  control: Control
  token: WalletToken
  onMaxPress: (amount: string) => void
  fee: BigNumber
}

function AmountRow ({ token, control, onMaxPress, fee }: AmountForm): JSX.Element {
  const Icon = getTokenIcon(token.avatarSymbol)
  const maxAmount = token.symbol === 'DFI' ? new BigNumber(token.amount).minus(fee).toFixed(8) : token.amount
  return (
    <>
      <Text
        style={tailwind('text-sm font-bold pl-4 mt-8 mb-2')}
      >{translate('screens/SendScreen', 'SEND')}
      </Text>
      <Controller
        control={control}
        rules={{
          required: true,
          pattern: /^\d*\.?\d*$/,
          max: maxAmount
        }}
        render={({ field: { onBlur, onChange, value } }) => (
          <View style={tailwind('flex-row w-full border-b border-gray-100')}>
            <TextInput
              style={tailwind('flex-grow p-4 bg-white')}
              autoCapitalize='none'
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType='numeric'
              placeholder={translate('screens/SendScreen', 'Enter an amount')}
            />
            <View style={tailwind('flex-row bg-white pr-4 items-center')}>
              <Icon />
              <Text style={tailwind('ml-2')}>{token.symbol}</Text>
            </View>
          </View>
        )}
        name='amount'
        defaultValue=''
      />
      <View style={tailwind('flex-row w-full bg-white p-4')}>
        <View style={tailwind('flex-grow flex-row')}>
          <Text>{translate('screens/SendScreen', 'Balance: ')}</Text>
          <NumberFormat
            value={maxAmount} decimalScale={8} thousandSeparator displayType='text' suffix={` ${token.symbol}`}
            renderText={(value) => <Text style={tailwind('text-gray-500')}>{value}</Text>}
          />
        </View>
        <TouchableOpacity onPress={() => onMaxPress(maxAmount)}>
          <Text
            style={[PrimaryColorStyle.text, tailwind('font-bold')]}
          >{translate('screens/SendScreen', 'MAX')}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  )
}
