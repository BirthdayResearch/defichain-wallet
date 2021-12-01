import { InputHelperText } from '@components/InputHelperText'
import { WalletTextInput } from '@components/WalletTextInput'
import { DeFiAddress } from '@defichain/jellyfish-address'
import { NetworkName } from '@defichain/jellyfish-network'
import { StackScreenProps } from '@react-navigation/stack'
import { DFITokenSelector, DFIUtxoSelector, WalletToken } from '@store/wallet'
import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
import { Control, Controller, useForm } from 'react-hook-form'
import { Platform, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from '@components/Button'
import { AmountButtonTypes, SetAmountButton } from '@components/SetAmountButton'
import {
  ThemedIcon,
  ThemedScrollView,
  ThemedSectionTitle,
  ThemedText,
  ThemedTouchableOpacity,
  ThemedView
} from '@components/themed'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { useTokensAPI } from '@hooks/wallet/TokensAPI'
import { RootState } from '@store'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { hasTxQueued } from '@store/transaction_queue'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { BalanceParamList } from '../BalancesNavigator'
import { FeeInfoRow } from '@components/FeeInfoRow'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { ConversionInfoText } from '@components/ConversionInfoText'
import { NumberRow } from '@components/NumberRow'
import { ReservedDFIInfoText } from '@components/ReservedDFIInfoText'
import { queueConvertTransaction, useConversion } from '@hooks/wallet/Conversion'

type Props = StackScreenProps<BalanceParamList, 'SendScreen'>

export function SendScreen ({
  route,
  navigation
}: Props): JSX.Element {
  const logger = useLogger()
  const { networkName } = useNetworkContext()
  const client = useWhaleApiClient()
  const tokens = useTokensAPI()
  const [token, setToken] = useState(route.params.token)
  const {
    control,
    setValue,
    formState,
    getValues,
    trigger
  } = useForm({ mode: 'onChange' })
  const dispatch = useDispatch()
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001))
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const DFIUtxo = useSelector((state: RootState) => DFIUtxoSelector(state.wallet))
  const DFIToken = useSelector((state: RootState) => DFITokenSelector(state.wallet))
  const {
    isConversionRequired,
    conversionAmount
  } = useConversion({
    inputToken: {
      type: token.id === '0_unified' ? 'utxo' : 'others',
      amount: new BigNumber(getValues('amount'))
    },
    deps: [getValues('amount'), JSON.stringify(token)]
  })

  useEffect(() => {
    client.fee.estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(logger.error)
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

    const values = getValues()
    if (formState.isValid && isConversionRequired) {
      queueConvertTransaction({
        mode: 'accountToUtxos',
        amount: conversionAmount
      }, dispatch, () => {
        navigation.navigate({
          name: 'SendConfirmationScreen',
          params: {
            destination: values.address,
            token,
            amount: new BigNumber(values.amount),
            fee,
            conversion: {
              DFIUtxo,
              DFIToken,
              isConversionRequired,
              conversionAmount
            }
          },
          merge: true
        })
      }, logger)
    } else if (formState.isValid) {
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
    <ThemedScrollView contentContainerStyle={tailwind('py-8')} testID='send_screen'>
      <View style={tailwind('px-4')}>
        <AddressRow
          control={control}
          networkName={networkName}
          onQrButtonPress={() => navigation.navigate({
            name: 'BarCodeScanner',
            params: {
              onQrScanned: async (value) => {
                setValue('address', value, { shouldDirty: true })
                await trigger('address')
              }
            },
            merge: true
          })}
          onClearButtonPress={async () => {
            setValue('address', '')
            await trigger('address')
          }}
          onAddressChange={async (address) => {
            setValue('address', address, { shouldDirty: true })
            await trigger('address')
          }}
        />

        <AmountRow
          control={control}
          onAmountChange={async (amount) => {
            setValue('amount', amount, { shouldDirty: true })
            await trigger('amount')
          }}
          onClearButtonPress={async () => {
            setValue('amount', '')
            await trigger('amount')
          }}
          token={token}
        />

        <ReservedDFIInfoText />
        {isConversionRequired &&
          <View style={tailwind('mt-2')}>
            <ConversionInfoText />
          </View>}
      </View>

      {
        fee !== undefined && (
          <View style={tailwind()}>
            <ThemedSectionTitle
              text={translate('screens/SendScreen', 'TRANSACTION DETAILS')}
            />
            {isConversionRequired &&
              <NumberRow
                lhs={translate('screens/SendScreen', 'Amount to be converted')}
                rhs={{
                value: conversionAmount.toFixed(8),
                testID: 'text_amount_to_convert',
                suffixType: 'text',
                suffix: token.displaySymbol
              }}
              />}

            <FeeInfoRow
              type='ESTIMATED_FEE'
              value={fee.toString()}
              testID='transaction_fee'
              suffix='DFI'
            />
          </View>
        )
      }
      <ThemedText
        testID='transaction_details_info_text'
        light={tailwind('text-gray-600')}
        dark={tailwind('text-gray-300')}
        style={tailwind('mt-2 mx-4 text-sm')}
      >
        {isConversionRequired
          ? translate('screens/SendScreen', 'Authorize transaction in the next screen to convert')
          : translate('screens/SendScreen', 'Review full transaction details in the next screen')}
      </ThemedText>

      <Button
        disabled={!formState.isValid || hasPendingJob || hasPendingBroadcastJob}
        label={translate('screens/SendScreen', 'CONTINUE')}
        onPress={onSubmit}
        testID='send_submit_button'
        title='Send'
        margin='mt-14 mx-4'
      />
    </ThemedScrollView>
  )
}

function AddressRow ({
  control,
  networkName,
  onQrButtonPress,
  onClearButtonPress,
  onAddressChange
}: { control: Control, networkName: NetworkName, onQrButtonPress: () => void, onClearButtonPress: () => void, onAddressChange: (address: string) => void }): JSX.Element {
  const defaultValue = ''
  return (
    <>
      <Controller
        control={control}
        defaultValue={defaultValue}
        name='address'
        render={({
          field: {
            value,
            onChange
          }
        }) => (
          <View style={tailwind('flex-row w-full mb-6')}>
            <WalletTextInput
              autoCapitalize='none'
              multiline
              onChange={onChange}
              onChangeText={onAddressChange}
              placeholder={translate('screens/SendScreen', 'Paste wallet address here')}
              style={tailwind('w-3/5 flex-grow pb-1', { 'h-8': Platform.OS !== 'ios' && Platform.OS !== 'android' })}
              testID='address_input'
              value={value}
              displayClearButton={value !== defaultValue}
              onClearButtonPress={onClearButtonPress}
              title={translate('screens/SendScreen', 'Where do you want to send?')}
              titleTestID='title_to_address'
              inputType='default'
            >
              {(Platform.OS === 'ios' || Platform.OS === 'android') &&
                (
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
                )}
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
  onAmountChange: (amount: string) => void
  onClearButtonPress: () => void
}

function AmountRow ({
  token,
  control,
  onAmountChange,
  onClearButtonPress
}: AmountForm): JSX.Element {
  const reservedDFI = 0.1
  let maxAmount = token.symbol === 'DFI' ? new BigNumber(token.amount).minus(reservedDFI).toFixed(8) : token.amount
  maxAmount = BigNumber.max(maxAmount, 0).toFixed(8)
  const defaultValue = ''
  return (
    <>
      <Controller
        control={control}
        defaultValue={defaultValue}
        name='amount'
        render={({
          field: {
            onChange,
            value
          }
        }) => (
          <ThemedView
            dark={tailwind('bg-transparent')}
            light={tailwind('bg-transparent')}
            style={tailwind('flex-row w-full')}
          >
            <WalletTextInput
              autoCapitalize='none'
              onChange={onChange}
              onChangeText={onAmountChange}
              placeholder={translate('screens/SendScreen', 'Enter an amount')}
              style={tailwind('flex-grow w-2/5')}
              testID='amount_input'
              value={value}
              displayClearButton={value !== defaultValue}
              onClearButtonPress={onClearButtonPress}
              title={translate('screens/SendScreen', 'How much do you want to send?')}
              titleTestID='title_send'
              inputType='numeric'
            >
              <ThemedView
                dark={tailwind('bg-gray-800')}
                light={tailwind('bg-white')}
                style={tailwind('flex-row items-center')}
              >
                <SetAmountButton
                  amount={new BigNumber(maxAmount)}
                  onPress={onAmountChange}
                  type={AmountButtonTypes.half}
                />

                <SetAmountButton
                  amount={new BigNumber(maxAmount)}
                  onPress={onAmountChange}
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

      <InputHelperText
        testID='max_value'
        label={`${translate('screens/SendScreen', 'Available')}: `}
        content={maxAmount}
        suffix={` ${token.displaySymbol}`}
      />
    </>
  )
}
