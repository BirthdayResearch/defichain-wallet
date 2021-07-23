import { DeFiAddress } from '@defichain/jellyfish-address'
import { NetworkName } from '@defichain/jellyfish-network'
import { CTransactionSegWit, TransactionSegWit } from '@defichain/jellyfish-transaction'
import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { MaterialIcons } from '@expo/vector-icons'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
import { Control, Controller, useForm } from 'react-hook-form'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import NumberFormat from 'react-number-format'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch } from 'redux'
import { Logging } from '../../../../../api/logging'
import { Text, TextInput } from '../../../../../components'
import { getTokenIcon } from '../../../../../components/icons/tokens/_index'
import { PrimaryButton } from '../../../../../components/PrimaryButton'
import { SectionTitle } from '../../../../../components/SectionTitle'
import { useNetworkContext } from '../../../../../contexts/NetworkContext'
import { useWhaleApiClient } from '../../../../../contexts/WhaleContext'
import { RootState } from '../../../../../store'
import { hasTxQueued, ocean } from '../../../../../store/ocean'
import { WalletToken } from '../../../../../store/wallet'
import { tailwind } from '../../../../../tailwind'
import { translate } from '../../../../../translations'
import { BalanceParamList } from '../BalancesNavigator'

interface SendForm {
  amount: BigNumber
  address: string
  token: AddressToken
  networkName: NetworkName
}

async function send ({
  address,
  token,
  amount,
  networkName
}: SendForm, dispatch: Dispatch<any>): Promise<void> {
  try {
    const to = DeFiAddress.from(networkName, address).getScript()

    const signer = async (account: WhaleWalletAccount): Promise<CTransactionSegWit> => {
      const script = await account.getScript()
      const builder = account.withTransactionBuilder()

      let signed: TransactionSegWit
      if (token.symbol === 'DFI') {
        signed = await builder.utxo.send(amount, to, script)
      } else {
        signed = await builder.account.accountToAccount({
          from: script,
          to: [{ script: to, balances: [{ token: +token.id, amount }] }]
        }, script)
      }
      return new CTransactionSegWit(signed)
    }

    dispatch(ocean.actions.queueTransaction({
      sign: signer,
      title: `${translate('screens/SendScreen', 'Sending')} ${token.symbol}`
    }))
  } catch (e) {
    Logging.error(e)
    dispatch(ocean.actions.setError(e))
  }
}

type Props = StackScreenProps<BalanceParamList, 'SendScreen'>

export function SendScreen ({ route, navigation }: Props): JSX.Element {
  const { networkName } = useNetworkContext()
  const client = useWhaleApiClient()
  const [token] = useState(route.params.token)
  const { control, setValue, formState: { isValid }, getValues, trigger } = useForm({ mode: 'onChange' })
  const dispatch = useDispatch()
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.ocean))

  useEffect(() => {
    client.transactions.estimateFee().then((f) => setFee(new BigNumber(f))).catch((e) => Logging.error(e))
  }, [])

  async function onSubmit (): Promise<void> {
    if (hasPendingJob) {
      return
    }
    setIsSubmitting(true)
    if (isValid) {
      const values = getValues()
      await send({
        address: values.address,
        token,
        amount: new BigNumber(values.amount),
        networkName
      }, dispatch)
    }
    setIsSubmitting(false)
  }

  return (
    <ScrollView style={tailwind('bg-gray-100')}>
      <AddressRow
        control={control}
        networkName={networkName}
        onQrButtonPress={() => navigation.navigate('BarCodeScanner', {
          onQrScanned: value => setValue('address', value)
        })}
      />
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
      <PrimaryButton disabled={!isValid || isSubmitting || hasPendingJob} title='Send' onPress={onSubmit}>
        <Text style={tailwind('text-white font-bold')}>{translate('screens/SendScreen', 'SEND')}</Text>
      </PrimaryButton>
    </ScrollView>
  )
}

function AddressRow ({
  control,
  networkName,
  onQrButtonPress
}: { control: Control, networkName: NetworkName, onQrButtonPress: () => void }): JSX.Element {
  return (
    <>
      <SectionTitle
        text={translate('screens/SendScreen', 'TO ADDRESS')}
        testID='title_to_address'
      />
      <Controller
        control={control}
        rules={{
          required: true,
          validate: {
            isValidAddress: (address) => DeFiAddress.from(networkName, address).valid
          }
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
              style={tailwind('w-14 p-4 bg-white')}
              onPress={onQrButtonPress}
            >
              <MaterialIcons name='qr-code-scanner' size={24} style={tailwind('text-primary')} />
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
  let maxAmount = token.symbol === 'DFI' ? new BigNumber(token.amount).minus(fee).toFixed(8) : token.amount
  maxAmount = BigNumber.max(maxAmount, 0).toFixed(8)
  return (
    <>
      <SectionTitle
        text={translate('screens/SendScreen', 'SEND')}
        testID='title_send'
      />
      <Controller
        control={control}
        rules={{
          required: true,
          pattern: /^\d*\.?\d*$/,
          max: maxAmount,
          validate: {
            greaterThanZero: (value: string) => new BigNumber(value !== undefined && value !== '' ? value : 0).isGreaterThan(0)
          }
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
            style={tailwind('font-bold text-primary')}
          >{translate('screens/SendScreen', 'MAX')}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  )
}
