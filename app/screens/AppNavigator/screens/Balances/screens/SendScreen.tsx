import { DeFiAddress } from '@defichain/jellyfish-address'
import { NetworkName } from '@defichain/jellyfish-network'
import { MaterialIcons } from '@expo/vector-icons'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
import { Control, Controller, useForm } from 'react-hook-form'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import NumberFormat from 'react-number-format'
import { useSelector } from 'react-redux'
import { Logging } from '../../../../../api'
import { Text, TextInput } from '../../../../../components'
import { Button } from '../../../../../components/Button'
import { getTokenIcon } from '../../../../../components/icons/tokens/_index'
import { IconLabelScreenType, InputIconLabel } from '../../../../../components/InputIconLabel'
import { NumberTextInput } from '../../../../../components/NumberTextInput'
import { SectionTitle } from '../../../../../components/SectionTitle'
import { AmountButtonTypes, SetAmountButton } from '../../../../../components/SetAmountButton'
import { useNetworkContext } from '../../../../../contexts/NetworkContext'
import { useWhaleApiClient } from '../../../../../contexts/WhaleContext'
import { useTokensAPI } from '../../../../../hooks/wallet/TokensAPI'
import { RootState } from '../../../../../store'
import { hasTxQueued } from '../../../../../store/transaction_queue'
import { WalletToken } from '../../../../../store/wallet'
import { tailwind } from '../../../../../tailwind'
import { translate } from '../../../../../translations'
import { BalanceParamList } from '../BalancesNavigator'

type Props = StackScreenProps<BalanceParamList, 'SendScreen'>

export function SendScreen ({ route, navigation }: Props): JSX.Element {
  const { networkName } = useNetworkContext()
  const client = useWhaleApiClient()
  const tokens = useTokensAPI()
  const [token, setToken] = useState(route.params.token)
  const { control, setValue, formState: { isValid }, getValues, trigger } = useForm({ mode: 'onChange' })
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001))
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))

  useEffect(() => {
    client.fee.estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(Logging.error)
  }, [])

  useEffect(() => {
    const t = tokens.find((t) => t.id === token.id)
    if (t !== undefined) {
      setToken({ ...t })
    }
  }, [JSON.stringify(tokens)])

  async function onSubmit (): Promise<void> {
    if (hasPendingJob) {
      return
    }
    if (isValid) {
      const values = getValues()
      navigation.navigate({
        name: 'SendConfirmationScreen',
        params: {
          destination: values.address,
          token,
          amount: new BigNumber(values.amount),
          fee
        },
        merge: true
      })
    }
  }

  return (
    <ScrollView style={tailwind('bg-gray-100')}>
      <AddressRow
        control={control}
        networkName={networkName}
        onQrButtonPress={() => navigation.navigate({
          name: 'BarCodeScanner',
          params: {
            onQrScanned: async (value) => {
              setValue('address', value)
              await trigger('address')
            }
          },
          merge: true
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
              <Text>{translate('screens/SendScreen', 'Estimated fee')}</Text>
            </View>
            <NumberFormat
              value={fee.toString()} decimalScale={8} thousandSeparator displayType='text' suffix=' DFI (UTXO)'
              renderText={(value) => <Text testID='transaction_fee' style={tailwind('text-gray-500')}>{value}</Text>}
            />
          </View>
        )
      }
      <Button
        testID='send_submit_button'
        disabled={!isValid || hasPendingJob}
        label={translate('screens/SendScreen', 'CONTINUE')}
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
              placeholderTextColor='rgba(0, 0, 0, 0.4)'
              testID='address_input'
              style={tailwind('w-4/5 flex-grow p-4 pr-0 bg-white')}
              autoCapitalize='none'
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder={translate('screens/SendScreen', 'Enter an address')}
              multiline
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
            <NumberTextInput
              testID='amount_input'
              style={tailwind('flex-grow p-4 bg-white')}
              autoCapitalize='none'
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder={translate('screens/SendScreen', 'Enter an amount')}
            />
            <View style={tailwind('flex-row bg-white pr-4 items-center')}>
              <Icon />
              <InputIconLabel testID='token_symbol' label={token.symbol} screenType={IconLabelScreenType.Balance} />
            </View>
          </View>
        )}
        name='amount'
        defaultValue=''
      />
      <View style={tailwind('flex-row w-full bg-white px-4 items-center')}>
        <View style={tailwind('flex-1 flex-row py-4 flex-wrap mr-2')}>
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
