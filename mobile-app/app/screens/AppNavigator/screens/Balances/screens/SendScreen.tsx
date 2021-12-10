import { InputHelperText } from '@components/InputHelperText'
import { WalletTextInput } from '@components/WalletTextInput'
import { DeFiAddress } from '@defichain/jellyfish-address'
import { NetworkName } from '@defichain/jellyfish-network'
import { StackScreenProps } from '@react-navigation/stack'
import { DFITokenSelector, DFIUtxoSelector, WalletToken } from '@store/wallet'
import BigNumber from 'bignumber.js'
import React, { useCallback, useEffect, useRef, useState } from 'react'
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
import { SymbolIcon } from '@components/SymbolIcon'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { BottomSheetNavScreen, BottomSheetWebWithNav, BottomSheetWithNav } from '@components/BottomSheetWithNav'
import { BottomSheetToken, BottomSheetTokenList } from '@components/BottomSheetTokenList'
import { InfoText } from '@components/InfoText'

type Props = StackScreenProps<BalanceParamList, 'SendScreen'>

export function SendScreen ({
  route,
  navigation
}: Props): JSX.Element {
  const logger = useLogger()
  const { networkName } = useNetworkContext()
  const client = useWhaleApiClient()
  const tokens = useTokensAPI()
  const [token, setToken] = useState(route.params?.token)
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
      type: token?.id === '0_unified' ? 'utxo' : 'others',
      amount: new BigNumber(getValues('amount'))
    },
    deps: [getValues('amount'), JSON.stringify(token)]
  })

  // Bottom sheet token
  const [isModalDisplayed, setIsModalDisplayed] = useState(false)
  const [bottomSheetScreen, setBottomSheetScreen] = useState<BottomSheetNavScreen[]>([])
  const containerRef = useRef(null)
  const bottomSheetRef = useRef<BottomSheetModal>(null)
  const expandModal = useCallback(() => {
    if (Platform.OS === 'web') {
      setIsModalDisplayed(true)
    } else {
      bottomSheetRef.current?.present()
    }
  }, [])
  const dismissModal = useCallback(() => {
    if (Platform.OS === 'web') {
      setIsModalDisplayed(false)
    } else {
      bottomSheetRef.current?.close()
    }
  }, [])

  useEffect(() => {
    client.fee.estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(logger.error)
  }, [])

  useEffect(() => {
    const t = tokens.find((t) => t.id === token?.id)
    if (t !== undefined) {
      setToken({ ...t })
    }
  }, [JSON.stringify(tokens)])

  useEffect(() => {
    setBottomSheetScreen([
      {
        stackScreenName: 'TokenList',
        component: BottomSheetTokenList({
          tokens: getBottomSheetToken(tokens),
          headerLabel: translate('screens/SendScreen', 'Choose token to send'),
          onCloseButtonPress: () => dismissModal(),
          onTokenPress: async (item): Promise<void> => {
            const _token = tokens.find(t => t.id === item.tokenId)
            if (_token !== undefined) {
              setToken(_token)
              setValue('amount', '')
              await trigger('amount')
            }
            dismissModal()
          }
        }),
        option: {
          header: () => null
        }
      }])
  }, [tokens])

  async function onSubmit (): Promise<void> {
    if (hasPendingJob || hasPendingBroadcastJob || token === undefined) {
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
    <View style={tailwind('h-full')} ref={containerRef}>
      <ThemedScrollView contentContainerStyle={tailwind('pt-6 pb-8')} testID='send_screen'>
        <TokenInput token={token} onPress={expandModal} />

        {token === undefined
            ? (
              <ThemedText style={tailwind('px-4')}>
                {translate('screens/SendScreen', 'Select a token you want to send to get started')}
              </ThemedText>
            )
            : (
              <>
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
                          lhs={translate('screens/SendScreen', 'UTXO to be converted')}
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
                  dark={tailwind('text-dfxgray-300')}
                  style={tailwind('mt-2 mx-4 text-sm')}
                >
                  {isConversionRequired
                    ? translate('screens/SendScreen', 'Authorize transaction in the next screen to convert')
                    : translate('screens/SendScreen', 'Review full transaction details in the next screen')}
                </ThemedText>
              </>
            )}

        <Button
          disabled={!formState.isValid || hasPendingJob || hasPendingBroadcastJob || token === undefined}
          label={translate('screens/SendScreen', 'CONTINUE')}
          onPress={onSubmit}
          testID='send_submit_button'
          title='Send'
          margin='mt-14 mx-4'
        />

        {Platform.OS === 'web' && (
          <BottomSheetWebWithNav
            modalRef={containerRef}
            screenList={bottomSheetScreen}
            isModalDisplayed={isModalDisplayed}
          />
        )}

        {Platform.OS !== 'web' && (
          <BottomSheetWithNav
            modalRef={bottomSheetRef}
            screenList={bottomSheetScreen}
          />
        )}
      </ThemedScrollView>
    </View>
  )
}

function TokenInput (props: {token?: WalletToken, onPress: () => void}): JSX.Element {
  return (
    <View style={tailwind('px-4')}>
      <ThemedText
        testID='transaction_details_info_text'
        light={tailwind('text-gray-600')}
        dark={tailwind('text-dfxgray-300')}
        style={tailwind('text-xl font-semibold')}
      >
        {translate('screens/SendScreen', 'Send to other wallet')}
      </ThemedText>
      {/* TODO */}
      <ThemedTouchableOpacity
        onPress={props.onPress}
        light={tailwind('border-gray-300 bg-white')}
        dark={tailwind('bg-dfxblue-800 border-dfxblue-900')}
        style={tailwind('border rounded w-full flex flex-row justify-between h-12 items-center px-2', {
          'mb-10': props.token?.isLPS === false,
          'mb-2': props.token?.isLPS === true,
          'mb-6': props.token === undefined
        })}
        testID='select_token_input'
      >
        {props.token === undefined
          ? (
            <ThemedText
              light={tailwind('text-gray-300')}
              dark={tailwind('text-dfxgray-500')}
              style={tailwind('text-sm')}
              testID='select_token_placeholder'
            >
              {translate('screens/SendScreen', 'Select token')}
            </ThemedText>
          )
          : (
            <View style={tailwind('flex flex-row')}>
              <SymbolIcon symbol={props.token.displaySymbol} styleProps={{ width: 24, height: 24 }} />
              <ThemedText
                style={tailwind('ml-2 font-medium')}
                testID='selected_token'
              >
                {props.token.displaySymbol}
              </ThemedText>
            </View>
          )}
        <ThemedIcon
          iconType='MaterialIcons'
          name='unfold-more'
          size={24}
          light={tailwind('text-primary-500')}
          dark={tailwind('text-dfxred-500')}
          style={tailwind('-mr-1.5 flex-shrink-0')}
        />
      </ThemedTouchableOpacity>
      {props.token?.isLPS === true &&
          (
            <InfoText
              testID='lp_info_text'
              text={translate('components/ConversionInfoText', 'Send Liquidity Pool tokens only to DeFiChain compatible wallets. Otherwise, sending to other exchanges may result in irreversible loss of funds.')}
              style={tailwind('mb-10')}
            />
          )}
    </View>
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
              style={tailwind('w-3/5 flex-grow pb-1')}
              testID='address_input'
              value={value}
              displayClearButton={value !== defaultValue}
              onClearButtonPress={onClearButtonPress}
              title={translate('screens/SendScreen', 'Where do you want to send?')}
              titleTestID='title_to_address'
              inputType='default'
            >
              <ThemedTouchableOpacity
                dark={tailwind('bg-dfxblue-900')}
                light={tailwind('bg-white')}
                onPress={onQrButtonPress}
                style={tailwind('w-9 p-1.5')}
                testID='qr_code_button'
              >
                <ThemedIcon
                  dark={tailwind('text-dfxred-500')}
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

function getBottomSheetToken (tokens: WalletToken[]): BottomSheetToken[] {
  return tokens.filter(t => {
    return new BigNumber(t.amount).isGreaterThan(0) && t.id !== '0' && t.id !== '0_utxo'
  }).map(t => {
    const token: BottomSheetToken = {
      tokenId: t.id,
      available: new BigNumber(t.amount),
      token: {
        name: t.name,
        displaySymbol: t.displaySymbol,
        symbol: t.symbol
      }
    }
    return token
  })
}
