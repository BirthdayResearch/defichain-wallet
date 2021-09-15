import { InfoText } from '@components/InfoText'
import { WalletTextInput } from '@components/WalletTextInput'
import { DeFiAddress } from '@defichain/jellyfish-address'
import { NetworkName } from '@defichain/jellyfish-network'
import { StackScreenProps } from '@react-navigation/stack'
import { WalletToken } from '@store/wallet'
import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
import { Control, Controller, FieldValues, useForm, UseFormGetValues, UseFormReset } from 'react-hook-form'
import { ScrollView, View } from 'react-native'
import NumberFormat from 'react-number-format'
import { useSelector } from 'react-redux'
import { Logging } from '../../../../../api'
import { Button } from '../../../../../components/Button'
import { AmountButtonTypes, SetAmountButton } from '../../../../../components/SetAmountButton'
import {
  ThemedIcon,
  ThemedText,
  ThemedTouchableOpacity,
  ThemedView
} from '../../../../../components/themed'
import { useNetworkContext } from '../../../../../contexts/NetworkContext'
import { useWhaleApiClient } from '../../../../../contexts/WhaleContext'
import { useTokensAPI } from '../../../../../hooks/wallet/TokensAPI'
import { RootState } from '../../../../../store'
import { hasTxQueued as hasBroadcastQueued } from '../../../../../store/ocean'
import { hasTxQueued } from '../../../../../store/transaction_queue'
import { tailwind } from '../../../../../tailwind'
import { translate } from '../../../../../translations'
import { BalanceParamList } from '../BalancesNavigator'

type Props = StackScreenProps<BalanceParamList, 'SendScreen'>

export function SendScreen ({ route, navigation }: Props): JSX.Element {
  const { networkName } = useNetworkContext()
  const client = useWhaleApiClient()
  const tokens = useTokensAPI()
  const [token, setToken] = useState(route.params.token)
  const { control, setValue, formState: { isValid }, getValues, trigger, reset } = useForm({ mode: 'onChange' })
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001))
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const isUTXO = (token: WalletToken): boolean => {
    return token.id === '0_utxo'
  }

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
    if (hasPendingJob || hasPendingBroadcastJob) {
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
    <ScrollView contentContainerStyle={tailwind('px-4 py-8')}>
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
        control={control}
        onAmountButtonPress={async (amount) => {
          setValue('amount', amount, { shouldDirty: true })
          await trigger('amount')
        }}
        reset={reset}
        getValues={getValues}
        token={token}
      />

      {isUTXO(token) &&
        <InfoText
          testID='send_info_text'
          text={translate('screens/SendScreen', 'A small UTXO amount (0.1 DFI (UTXO)) is reserved for fees.')}
          style={tailwind('mx-0')}
        />}

      <Button
        disabled={!isValid || hasPendingJob || hasPendingBroadcastJob}
        label={translate('screens/SendScreen', 'CONTINUE')}
        onPress={onSubmit}
        testID='send_submit_button'
        title='Send'
        margin='mt-14'
      />

      <ThemedText
        light={tailwind('text-gray-600')}
        dark={tailwind('text-gray-300')}
        style={tailwind('mt-4 text-center')}
      >
        {translate('screens/SendScreen', 'See full details in next page to confirm ')}
      </ThemedText>
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
      <Controller
        control={control}
        defaultValue=''
        name='address'
        render={({ field: { value, onBlur, onChange } }) => (
          <View style={tailwind('flex-row w-full mb-6')}>
            <WalletTextInput
              autoCapitalize='none'
              multiline
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder={translate('screens/SendScreen', 'Paste wallet address here')}
              style={tailwind('w-4/5 flex-grow pb-1')}
              testID='address_input'
              value={value}
              title={translate('screens/SendScreen', 'Where do you want to send?')}
              inputType='default'
            >
              <ThemedTouchableOpacity
                dark={tailwind('bg-gray-800')}
                light={tailwind('bg-white')}
                onPress={onQrButtonPress}
                style={tailwind('w-9 p-1.5')}
                testID='qr_code_button'
              >
                <ThemedIcon
                  dark={tailwind('text-darkprimary-500')}
                  iconType='MaterialIcons'
                  light={tailwind('text-primary-500')}
                  name='qr-code-scanner'
                  size={24}
                />
              </ThemedTouchableOpacity>
            </WalletTextInput>
          </View>
        )}
        rules={{
          required: true,
          validate: {
            isValidAddress: (address) => DeFiAddress.from(networkName, address).valid
          }
        }}
      />
    </>
  )
}

interface AmountForm {
  control: Control
  token: WalletToken
  reset: UseFormReset<FieldValues>
  getValues: UseFormGetValues<FieldValues>
  onAmountButtonPress: (amount: string) => void
}

function AmountRow ({ token, control, reset, getValues, onAmountButtonPress }: AmountForm): JSX.Element {
  let maxAmount = token.symbol === 'DFI' ? new BigNumber(token.amount).minus(0.1).toFixed(8) : token.amount
  maxAmount = BigNumber.max(maxAmount, 0).toFixed(8)
  return (
    <>
      <Controller
        control={control}
        defaultValue=''
        name='amount'
        render={({ field: { onChange, value }, fieldState: { isDirty } }) => (
          <ThemedView
            dark={tailwind('bg-transparent')}
            light={tailwind('bg-transparent')}
            style={tailwind('flex-row w-full')}
          >
            <WalletTextInput
              autoCapitalize='none'
              onChangeText={onChange}
              placeholder={translate('screens/SendScreen', 'Enter an amount')}
              style={tailwind('flex-1 pb-1')}
              testID='amount_input'
              value={value}
              displayClearButton={true && isDirty}
              onClearButtonPress={() => reset({ ...getValues(), amount: '' })}
              title={translate('screens/SendScreen', 'How much do you want to send?')}
              inputType='numeric'
            >
              <ThemedView
                dark={tailwind('bg-gray-800')}
                light={tailwind('bg-white')}
                style={tailwind('flex-row items-center')}
              >
                <SetAmountButton
                  amount={new BigNumber(maxAmount)}
                  onPress={onAmountButtonPress}
                  type={AmountButtonTypes.half}
                />

                <SetAmountButton
                  amount={new BigNumber(maxAmount)}
                  onPress={onAmountButtonPress}
                  type={AmountButtonTypes.max}
                />
              </ThemedView>
            </WalletTextInput>

          </ThemedView>
        )}
        rules={{
          required: true,
          pattern: /^\d*\.?\d*$/,
          max: maxAmount,
          validate: {
            greaterThanZero: (value: string) => new BigNumber(value !== undefined && value !== '' ? value : 0).isGreaterThan(0)
          }
        }}
      />

      <View style={tailwind('flex-1 flex-row flex-wrap mt-1')}>
        <ThemedText
          light={tailwind('text-gray-400')}
          dark={tailwind('text-gray-500')}
        >
          {translate('screens/SendScreen', 'Available: ')}
        </ThemedText>

        <NumberFormat
          decimalScale={8}
          displayType='text'
          renderText={(value) => (
            <ThemedText
              light={tailwind('text-gray-700')}
              dark={tailwind('text-gray-200')}
              testID='max_value'
            >
              {value}
            </ThemedText>
            )}
          suffix={` ${token.displaySymbol}`}
          thousandSeparator
          value={maxAmount}
        />
      </View>
    </>
  )
}
