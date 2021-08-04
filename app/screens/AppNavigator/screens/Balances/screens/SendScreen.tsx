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
import { Logging } from '../../../../../api'
import { Text, TextInput } from '../../../../../components'
import { Button } from '../../../../../components/Button'
import { getTokenIcon } from '../../../../../components/icons/tokens/_index'
import { SectionTitle } from '../../../../../components/SectionTitle'
import { AmountButtonTypes, SetAmountButton } from '../../../../../components/SetAmountButton'
import { useNetworkContext } from '../../../../../contexts/NetworkContext'
import { useWhaleApiClient } from '../../../../../contexts/WhaleContext'
import { useTokensAPI } from '../../../../../hooks/wallet/TokensAPI'
import { RootState } from '../../../../../store'
import { hasTxQueued, transactionQueue } from '../../../../../store/transaction_queue'
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

    dispatch(transactionQueue.actions.push({
      sign: signer,
      title: `${translate('screens/SendScreen', 'Sending')} ${token.symbol}`
    }))
  } catch (e) {
    Logging.error(e)
  }
}

type Props = StackScreenProps<BalanceParamList, 'SendScreen'>

export function SendScreen ({ route, navigation }: Props): JSX.Element {
  const { networkName } = useNetworkContext()
  const client = useWhaleApiClient()
  const tokens = useTokensAPI()
  const [token, setToken] = useState(route.params.token)
  const { control, setValue, formState: { isValid }, getValues, trigger } = useForm({ mode: 'onChange' })
  const dispatch = useDispatch()
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))

  useEffect(() => {
    client.transactions.estimateFee().then((f) => setFee(new BigNumber(f))).catch((e) => Logging.error(e))
  }, [])

  useEffect(() => {
    const t = tokens.find((t) => t.id === token.id)
    if (t !== undefined) {
      setToken({ ...t })
    }
  }, [tokens])

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
        token={token}
        control={control}
        onAmountButtonPress={async (amount) => {
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
              renderText={(value) => <Text testID='transaction_fee' style={tailwind('text-gray-500')}>{value}</Text>}
            />
          </View>
        )
      }
      <Button
        testID='send_submit_button'
        disabled={!isValid || isSubmitting || hasPendingJob}
        label={translate('screens/SendScreen', 'SEND')}
        title='Send' onPress={onSubmit}
      />
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
              testID='address_input'
              style={tailwind('flex-grow p-4 bg-white')}
              autoCapitalize='none'
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder={translate('screens/SendScreen', 'Enter an address')}
            />
            <TouchableOpacity
              testID='qr_code_button'
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
  onAmountButtonPress: (amount: string) => void
  fee: BigNumber
}

function AmountRow ({ token, control, onAmountButtonPress, fee }: AmountForm): JSX.Element {
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
              testID='amount_input'
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
              <Text testID='token_symbol' style={tailwind('ml-2')}>{token.symbol}</Text>
            </View>
          </View>
        )}
        name='amount'
        defaultValue=''
      />
      <View style={tailwind('flex-row w-full bg-white px-4 items-center')}>
        <View style={tailwind('flex-1 flex-row py-4')}>
          <Text>{translate('screens/SendScreen', 'Balance: ')}</Text>
          <NumberFormat
            value={maxAmount} decimalScale={8} thousandSeparator displayType='text' suffix={` ${token.symbol}`}
            renderText={(value) => <Text testID='max_value' style={tailwind('text-gray-500')}>{value}</Text>}
          />
        </View>
        <SetAmountButton
          type={AmountButtonTypes.half} onPress={onAmountButtonPress}
          amount={new BigNumber(maxAmount)}
        />
        <SetAmountButton type={AmountButtonTypes.max} onPress={onAmountButtonPress} amount={new BigNumber(maxAmount)} />
      </View>
    </>
  )
}
