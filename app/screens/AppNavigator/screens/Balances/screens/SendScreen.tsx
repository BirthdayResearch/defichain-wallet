import { InfoText } from '@components/InfoText'
import { DeFiAddress } from '@defichain/jellyfish-address'
import { NetworkName } from '@defichain/jellyfish-network'
import { StackScreenProps } from '@react-navigation/stack'
import { WalletToken } from '@store/wallet'
import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
import { Control, Controller, useForm } from 'react-hook-form'
import { ScrollView, View } from 'react-native'
import NumberFormat from 'react-number-format'
import { useSelector } from 'react-redux'
import { Logging } from '../../../../../api'
import { Button } from '../../../../../components/Button'
import { getNativeIcon } from '../../../../../components/icons/assets'
import { IconLabelScreenType, InputIconLabel } from '../../../../../components/InputIconLabel'
import { NumberRow } from '../../../../../components/NumberRow'
import { NumberTextInput } from '../../../../../components/NumberTextInput'
import { SectionTitle } from '../../../../../components/SectionTitle'
import { AmountButtonTypes, SetAmountButton } from '../../../../../components/SetAmountButton'
import {
  ThemedIcon,
  ThemedText,
  ThemedTextInput,
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
  const { control, setValue, formState: { isValid }, getValues, trigger } = useForm({ mode: 'onChange' })
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
    <ScrollView>
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
          setValue('amount', amount)
          await trigger('amount')
        }}
        token={token}
      />

      {
        fee !== undefined && (
          <View style={tailwind('mt-6')}>
            <NumberRow
              lhs={translate('screens/SendScreen', 'Estimated fee')}
              rightHandElements={[{ value: fee.toString(), suffix: ' DFI (UTXO)', testID: 'transaction_fee' }]}
            />
          </View>
        )
      }

      {isUTXO(token) && <InfoText testID='send_info_text' text={translate('screens/SendScreen', 'A small UTXO amount (0.1 DFI (UTXO)) is reserved for fees.')} />}

      <Button
        disabled={!isValid || hasPendingJob || hasPendingBroadcastJob}
        label={translate('screens/SendScreen', 'CONTINUE')}
        onPress={onSubmit}
        testID='send_submit_button'
        title='Send'
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
        testID='title_to_address'
        text={translate('screens/SendScreen', 'TO ADDRESS')}
      />

      <Controller
        control={control}
        defaultValue=''
        name='address'
        render={({ field: { value, onBlur, onChange } }) => (
          <View style={tailwind('flex-row w-full')}>
            <ThemedTextInput
              autoCapitalize='none'
              multiline
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder={translate('screens/SendScreen', 'Enter an address')}
              style={tailwind('w-4/5 flex-grow p-4 pr-0')}
              testID='address_input'
              value={value}
            />

            <ThemedTouchableOpacity
              dark={tailwind('bg-gray-800')}
              light={tailwind('bg-white')}
              onPress={onQrButtonPress}
              style={tailwind('w-14 p-4')}
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
  onAmountButtonPress: (amount: string) => void
}

function AmountRow ({ token, control, onAmountButtonPress }: AmountForm): JSX.Element {
  const Icon = getNativeIcon(token.avatarSymbol)
  let maxAmount = token.symbol === 'DFI' ? new BigNumber(token.amount).minus(0.1).toFixed(8) : token.amount
  maxAmount = BigNumber.max(maxAmount, 0).toFixed(8)
  return (
    <>
      <SectionTitle
        testID='title_send'
        text={translate('screens/SendScreen', 'SEND')}
      />

      <Controller
        control={control}
        defaultValue=''
        name='amount'
        render={({ field: { onBlur, onChange, value } }) => (
          <ThemedView
            dark={tailwind('bg-gray-800 border-b border-gray-700')}
            light={tailwind('bg-white border-b border-gray-200')}
            style={tailwind('flex-row w-full')}
          >
            <NumberTextInput
              autoCapitalize='none'
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder={translate('screens/SendScreen', 'Enter an amount')}
              style={tailwind('flex-grow p-4')}
              testID='amount_input'
              value={value}
            />

            <ThemedView
              dark={tailwind('bg-gray-800')}
              light={tailwind('bg-white')}
              style={tailwind('flex-row pr-4 items-center')}
            >
              <Icon />

              <InputIconLabel
                label={token.displaySymbol}
                screenType={IconLabelScreenType.Balance}
                testID='token_symbol'
              />
            </ThemedView>
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

      <ThemedView
        dark={tailwind('bg-gray-800 border-b border-gray-700')}
        light={tailwind('bg-white border-b border-gray-200')}
        style={tailwind('flex-row w-full px-4 items-center')}
      >
        <View style={tailwind('flex-1 flex-row py-4 flex-wrap mr-2')}>
          <ThemedText>
            {translate('screens/SendScreen', 'Balance: ')}
          </ThemedText>

          <NumberFormat
            decimalScale={8}
            displayType='text'
            renderText={(value) => (
              <ThemedText
                dark={tailwind('text-gray-300')}
                light={tailwind('text-gray-500')}
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
    </>
  )
}
