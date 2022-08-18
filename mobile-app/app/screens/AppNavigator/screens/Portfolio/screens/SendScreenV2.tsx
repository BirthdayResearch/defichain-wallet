import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { Platform, TextInput, View } from 'react-native'
import BigNumber from 'bignumber.js'
import { Control, Controller, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { useToast } from 'react-native-toast-notifications'
import { StackScreenProps } from '@react-navigation/stack'
import { getColor, tailwind } from '@tailwind'
import { debounce } from 'lodash'
import { fromAddress } from '@defichain/jellyfish-address'
import { NetworkName } from '@defichain/jellyfish-network'
import { translate } from '@translations'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { RootState } from '@store'
import { AddressType, DFITokenSelector, DFIUtxoSelector, tokensSelector, WalletToken } from '@store/wallet'
import { LocalAddress } from '@store/userPreferences'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { hasTxQueued } from '@store/transaction_queue'
import { useDisplayUtxoWarning } from '@hooks/wallet/DisplayUtxoWarning'
import { queueConvertTransaction, useConversion } from '@hooks/wallet/Conversion'
import { useAppDispatch } from '@hooks/useAppDispatch'
import { useWalletAddress } from '@hooks/useWalletAddress'
import {
  ThemedIcon,
  ThemedTextInputV2,
  ThemedTextV2,
  ThemedTouchableOpacity,
  ThemedTouchableOpacityV2,
  ThemedViewV2
} from '@components/themed'
import { WalletTextInputV2 } from '@components/WalletTextInputV2'
import { SubmitButtonGroupV2 } from '@components/SubmitButtonGroupV2'
import { AmountButtonTypes, TransactionCard, TransactionCardStatus } from '@components/TransactionCard'
import { useTokenPrice } from '../hooks/TokenPrice'
import { ActiveUSDValueV2 } from '../../Loans/VaultDetail/components/ActiveUSDValueV2'
import { PortfolioParamList } from '../PortfolioNavigator'
import { RandomAvatar } from '../components/RandomAvatar'
import { TokenIcon } from '../components/TokenIcon'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type Props = StackScreenProps<PortfolioParamList, 'SendScreenV2'>

export interface BottomSheetToken {
  tokenId: string
  available: BigNumber
  token: {
    name: string
    displaySymbol: string
    symbol: string
    isLPS?: boolean
  }
  factor?: string
  reserve?: string
}

export function SendScreenV2 ({
  route,
  navigation
}: Props): JSX.Element {
  const dispatch = useAppDispatch()
  const logger = useLogger()
  const { networkName } = useNetworkContext()
  const client = useWhaleApiClient()
  const { isLight } = useThemeContext()
  const { getTokenPrice } = useTokenPrice()
  const { fetchWalletAddresses } = useWalletAddress()
  const { getDisplayUtxoWarningStatus } = useDisplayUtxoWarning()
  const toast = useToast()
  const TOAST_DURATION = 2000
  const BOTTOM_NAV_HEIGHT = 64
  const bottomInset = useSafeAreaInsets().bottom

  const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))
  const addressBook = useSelector((state: RootState) => state.userPreferences.addressBook)
  const walletAddress = useSelector((state: RootState) => state.userPreferences.addresses)
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const DFIUtxo = useSelector((state: RootState) => DFIUtxoSelector(state.wallet))
  const DFIToken = useSelector((state: RootState) => DFITokenSelector(state.wallet))

  const [token, setToken] = useState(route.params?.token)
  const [matchedAddress, setMatchedAddress] = useState<LocalAddress>()
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001))
  const [jellyfishWalletAddress, setJellyfishWalletAddresses] = useState<string[]>([])
  const [transactionCardStatus, setTransactionCardStatus] = useState(TransactionCardStatus.Default)

  // form
  const {
    control,
    setValue,
    formState,
    getValues,
    trigger,
    watch
  } = useForm({ mode: 'onChange' })
  const { address } = watch()
  const amountToSend = getValues('amount')
  const [addressType, setAddressType] = useState<AddressType>()

  const {
    isConversionRequired,
    conversionAmount
  } = useConversion({
    inputToken: {
      type: token?.id === '0_unified' ? 'utxo' : 'others',
      amount: new BigNumber(amountToSend)
    },
    deps: [amountToSend, JSON.stringify(token)]
  })

  const debounceMatchAddress = debounce(() => {
    if (address !== undefined && addressBook !== undefined && addressBook[address] !== undefined) {
      setMatchedAddress(addressBook[address])
      setAddressType(AddressType.Whitelisted)
    } else if (address !== undefined && walletAddress !== undefined && walletAddress[address] !== undefined) {
      setMatchedAddress(walletAddress[address])
      setAddressType(AddressType.WalletAddress)
    } else if (address !== undefined && jellyfishWalletAddress.includes(address)) {
      // wallet address that does not have a label
      setMatchedAddress({
        address,
        label: '',
        isMine: true
      })
      setAddressType(AddressType.WalletAddress)
    } else {
      setMatchedAddress(undefined)
      setAddressType(fromAddress(address, networkName) !== undefined ? AddressType.OthersButValid : undefined)
    }
  }, 200)

  const reservedDFI = 0.1
  const isReservedUtxoUsed = getDisplayUtxoWarningStatus(new BigNumber(amountToSend))

  const amountInputRef = useRef<TextInput>()
  const amountInUSDValue = useMemo(() => {
    if (token === undefined || isNaN(amountToSend) || (amountToSend === '')) {
      return new BigNumber(0)
    }

    return getTokenPrice(token.symbol, amountToSend, token.isLPS)
  }, [amountToSend, token])

  const {
    infoText,
    infoTextThemedProps
  } = useMemo(() => {
    let infoText
    let themedProps
    let status = TransactionCardStatus.Default

    if (new BigNumber(amountToSend).isGreaterThan(token?.amount ?? 0)) {
      infoText = 'Insufficient balance'
      themedProps = {
        dark: tailwind('text-red-v2'),
        light: tailwind('text-red-v2')
      }
      status = TransactionCardStatus.Error
    } else if (token?.isLPS === true && new BigNumber(amountToSend).isGreaterThan(0)) {
      infoText = 'Make sure to send your LP Tokens to only DeFiChain-compatible wallets. Failing to do so may lead to irreversible loss of funds'
      themedProps = {
        dark: tailwind('text-orange-v2'),
        light: tailwind('text-orange-v2')
      }
    } else if (isReservedUtxoUsed) {
      infoText = 'A small amount of UTXO is reserved for fees'
      themedProps = {
        dark: tailwind('text-orange-v2'),
        light: tailwind('text-orange-v2')
      }
    } else {
      infoText = 'There is a minimal fee for the transaction'
      themedProps = {
        light: tailwind('text-mono-light-v2-500'),
        dark: tailwind('text-mono-dark-v2-500')
      }
    }

    setTransactionCardStatus(status)
    return {
      infoText: translate('screens/SendScreen', infoText),
      infoTextThemedProps: {
        ...themedProps,
        style: tailwind('text-xs mt-2 ml-5 font-normal-v2')
      }
    }
  }, [token, isReservedUtxoUsed, amountToSend])

  useEffect(() => {
    setToken(route.params.token)
  }, [route.params.token])

  useEffect(() => {
    /* timeout added to auto display keyboard on Android */
    Platform.OS === 'android'
      ? setTimeout(() => amountInputRef?.current?.focus(), 0)
      : amountInputRef?.current?.focus()
  }, [])

  useEffect(() => {
    void fetchWalletAddresses().then((walletAddresses) => setJellyfishWalletAddresses(walletAddresses))
  }, [fetchWalletAddresses])

  useEffect(() => {
    client.fee.estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(logger.error)
  }, [])

  useEffect(() => {
    const t = tokens.find((t) => t.id === token?.id)
    if (t !== undefined) {
      setToken({
        ...t,
        amount: t.displaySymbol === 'DFI' ? new BigNumber(t.amount).minus(reservedDFI).toFixed(8) : t.amount
      })
    }
  }, [JSON.stringify(tokens)])

  useEffect(() => {
    debounceMatchAddress()
  }, [address, addressBook])

  function showToast (type: AmountButtonTypes): void {
    if (token?.displaySymbol === undefined) {
      return
    }

    toast.hideAll()
    const isMax = type === AmountButtonTypes.Max
    const toastMessage = isMax ? 'Max available {{unit}} entered' : '{{percent}} of available {{unit}} entered'
    const toastOption = {
      unit: token.displaySymbol,
      percent: type
    }
    toast.show(translate('screens/SendScreen', toastMessage, toastOption), {
      type: 'wallet_toast',
      placement: 'top',
      duration: TOAST_DURATION
    })
  }

  const onAddressSelect = useCallback(async (savedAddress: string) => {
    setValue('address', savedAddress, { shouldDirty: true })
    navigation.goBack()
    await trigger('address')
  }, [navigation])

  async function onSubmit (): Promise<void> {
    if (hasPendingJob || hasPendingBroadcastJob || token === undefined || !formState.isValid) {
      return
    }

    const values = getValues()
    const params: PortfolioParamList['SendConfirmationScreenV2'] = {
      destination: values.address,
      token,
      amount: new BigNumber(values.amount),
      amountInUsd: amountInUSDValue,
      fee,
      toAddressLabel: matchedAddress?.label,
      addressType
    }

    if (isConversionRequired) {
      queueConvertTransaction({
        mode: 'accountToUtxos',
        amount: conversionAmount
      }, dispatch, () => {
        params.conversion = {
          DFIUtxo,
          DFIToken,
          isConversionRequired: true,
          conversionAmount
        }
        navigation.navigate({
          name: 'SendConfirmationScreenV2',
          params,
          merge: true
        })
      }, logger, () => {
        params.conversion = {
          DFIUtxo,
          DFIToken,
          isConversionRequired: true,
          conversionAmount,
          isConverted: true
        }
        navigation.navigate({
          name: 'SendConfirmationScreenV2',
          params,
          merge: true
        })
      })
    } else {
      navigation.navigate({
        name: 'SendConfirmationScreenV2',
        params,
        merge: true
      })
    }
  }

  const onAmountChange = async (amount: string): Promise<void> => {
    setValue('amount', amount, { shouldDirty: true })
    await trigger('amount')
  }

  return (
    <View style={tailwind('h-full')}>
      <KeyboardAwareScrollView
        contentContainerStyle={tailwind('pt-6 pb-8')} testID='send_screen'
        style={tailwind(`${isLight ? 'bg-mono-light-v2-100' : 'bg-mono-dark-v2-100'}`)}
        extraScrollHeight={-BOTTOM_NAV_HEIGHT - bottomInset}
      >
        {token === undefined &&
          <ThemedTextV2 style={tailwind('px-5')}>
            {translate('screens/SendScreen', 'Select a token you want to send to get started')}
          </ThemedTextV2>}

        {token !== undefined && (
          <View style={tailwind('px-5')}>
            <View style={tailwind('my-12 items-center')}>
              <Controller
                control={control}
                defaultValue=''
                name='amount'
                render={({
                  field: {
                    onChange,
                    value
                  }
                }) => (
                  <ThemedTextInputV2
                    style={tailwind('text-3xl text-center font-semibold-v2 w-full')}
                    light={tailwind('text-mono-light-v2-900')}
                    dark={tailwind('text-mono-dark-v2-900')}
                    keyboardType='numeric'
                    value={value}
                    onChange={onChange}
                    onChangeText={onAmountChange}
                    placeholder='0.00'
                    placeholderTextColor={getColor(isLight ? 'mono-light-v2-900' : 'mono-dark-v2-900')}
                    testID='amount_input'
                    ref={amountInputRef}
                  />
                )}
                rules={{
                  required: true,
                  pattern: /^\d*\.?\d*$/,
                  max: BigNumber.max(token.amount, 0).toFixed(8),
                  validate: {
                    greaterThanZero: (value: string) => new BigNumber(value !== undefined && value !== '' ? value : 0).isGreaterThan(0)
                  }
                }}
              />
              <ActiveUSDValueV2
                price={amountInUSDValue} testId='amount_input_in_usd'
                containerStyle={tailwind('w-full break-words')}
                style={tailwind('text-center justify-center w-full')}
              />
            </View>

            <AmountCard
              onPress={async () => {
                navigation.navigate({
                  name: 'TokenSelectionScreen',
                  params: {},
                  merge: true
                })
                setValue('amount', '', { shouldDirty: true })
                await trigger('amount')
              }}
              onAmountChange={async (amount: string, type: AmountButtonTypes) => {
                showToast(type)
                setValue('amount', amount, { shouldDirty: true })
                await trigger('amount')
              }}
              token={token}
              transactionCardStatus={transactionCardStatus}
            />
            <ThemedTextV2 {...infoTextThemedProps} testID='info_text'>{infoText}</ThemedTextV2>

            <AddressRow
              control={control}
              networkName={networkName}
              onContactButtonPress={() => navigation.navigate({
                name: 'AddressBookScreen',
                params: {
                  selectedAddress: getValues('address'),
                  onAddressSelect
                },
                merge: true
              })}
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

            <View style={tailwind('ml-5 my-2 items-center flex flex-row')}>
              {addressType === AddressType.OthersButValid
                ? (
                  <>
                    <ThemedIcon
                      light={tailwind('text-success-500')}
                      dark={tailwind('text-darksuccess-500')}
                      iconType='MaterialIcons'
                      name='check-circle'
                      size={16}
                    />
                    <ThemedTextV2
                      style={tailwind('text-xs mx-1 font-normal-v2')}
                      light={tailwind('text-mono-light-v2-500')}
                      dark={tailwind('text-mono-dark-v2-500')}
                    >
                      {translate('screens/SendScreen', 'Verified')}
                    </ThemedTextV2>
                  </>
                )
                : (addressType !== undefined && (
                  <ThemedViewV2
                    style={tailwind('flex flex-row items-center overflow-hidden rounded-lg py-0.5', {
                        'px-1': addressType === AddressType.WalletAddress,
                        'px-2': addressType === AddressType.Whitelisted
                      })}
                    light={tailwind('bg-mono-light-v2-200')}
                    dark={tailwind('bg-mono-dark-v2-200')}
                  >
                    {addressType === AddressType.WalletAddress && (
                      <View style={tailwind('rounded-l-2xl mr-1')}>
                        <RandomAvatar name={matchedAddress?.address} size={12} />
                      </View>
                      )}

                    <ThemedTextV2
                      ellipsizeMode='middle'
                      numberOfLines={1}
                      style={[tailwind('text-xs font-normal-v2'), {
                          minWidth: 10,
                          maxWidth: 108
                        }]}
                      light={tailwind('text-mono-light-v2-500')}
                      dark={tailwind('text-mono-dark-v2-500')}
                      testID='address_input_footer'
                    >
                      {matchedAddress?.label !== '' ? matchedAddress?.label : matchedAddress.address}
                    </ThemedTextV2>
                  </ThemedViewV2>
                  )
                )}
            </View>

          </View>
        )}

        <View style={tailwind('mt-24 mx-12 items-center')}>
          {(formState.isValid && token !== undefined) &&
            <ThemedTextV2
              testID='transaction_details_info_text'
              light={tailwind('text-mono-light-v2-500')}
              dark={tailwind('text-mono-dark-v2-500')}
              style={tailwind('mt-2 text-xs text-center font-normal-v2')}
            >
              {isConversionRequired
                ? translate('screens/SendScreen', 'By continuing, the required amount of DFI will be converted')
                : translate('screens/SendScreen', 'Review full details in the next screen')}
            </ThemedTextV2>}
          <SubmitButtonGroupV2
            isDisabled={!formState.isValid || hasPendingJob || hasPendingBroadcastJob || token === undefined}
            label={translate('screens/SendScreen', 'Continue')}
            onSubmit={onSubmit}
            title='send_continue'
            displayCancelBtn={false}
            buttonStyle='mt-5'
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  )
}

function AddressRow ({
  control,
  networkName,
  onContactButtonPress,
  onQrButtonPress,
  onClearButtonPress,
  onAddressChange,
  inputFooter
}: { control: Control, networkName: NetworkName, onContactButtonPress: () => void, onQrButtonPress: () => void, onClearButtonPress: () => void, onAddressChange: (address: string) => void, inputFooter?: React.ReactElement }): JSX.Element {
  const defaultValue = ''
  return (
    <Controller
      control={control}
      defaultValue={defaultValue}
      name='address'
      render={({
        field: {
          value,
          onChange
        },
        fieldState: { error }
      }) => {
        const hasValidAddress = error?.type == null
        return (
          <View style={tailwind('flex w-full')}>
            <WalletTextInputV2
              autoCapitalize='none'
              multiline
              onBlur={async () => {
                await onAddressChange(value?.trim())
              }}
              onChangeText={onChange}
              placeholder={translate('screens/SendScreen', 'Paste address')}
              style={tailwind('w-3/5 flex-grow pb-1 font-normal-v2')}
              testID='address_input'
              value={value}
              displayClearButton={value !== defaultValue}
              onClearButtonPress={onClearButtonPress}
              title={translate('screens/SendScreen', 'SEND TO')}
              titleTestID='title_to_address'
              inputType='default'
              inputFooter={inputFooter}
              valid={hasValidAddress}
            >
              {value !== '' && <View style={tailwind('mr-2')} />}
              {value === '' &&
                <>
                  <ThemedTouchableOpacity
                    dark={tailwind('bg-black')}
                    light={tailwind('bg-white')}
                    onPress={onContactButtonPress}
                    style={tailwind('w-9 p-1.5 rounded')}
                    testID='address_book_button'
                  >
                    <ThemedIcon
                      iconType='Feather'
                      dark={tailwind('text-mono-dark-v2-700')}
                      light={tailwind('text-mono-light-v2-700')}
                      name='users'
                      size={24}
                    />
                  </ThemedTouchableOpacity>
                  <ThemedTouchableOpacity
                    dark={tailwind('bg-black')}
                    light={tailwind('bg-white')}
                    onPress={onQrButtonPress}
                    style={tailwind('w-9 p-1.5 rounded')}
                    testID='qr_code_button'
                  >
                    <ThemedIcon
                      dark={tailwind('text-mono-dark-v2-700')}
                      light={tailwind('text-mono-light-v2-700')}
                      iconType='MaterialIcons'
                      name='qr-code'
                      size={24}
                    />
                  </ThemedTouchableOpacity>
                </>}
            </WalletTextInputV2>
            {/* TODO: Replace with inline comment if possible @pierregee */}
            {/* TODO: Update with required error message also */}
            {!hasValidAddress &&
              <ThemedTextV2
                style={tailwind('text-xs mt-2 ml-5 font-normal-v2')}
                dark={tailwind('text-red-v2')}
                light={tailwind('text-red-v2')}
                testID='address_error_text'
              >
                {translate('screens/SendScreen', 'Invalid address. Make sure the address is correct to avoid irrecoverable losses')}
              </ThemedTextV2>}
          </View>
        )
      }}
      rules={{
        required: true,
        validate: {
          isValidAddress: (address) => (fromAddress(address, networkName) !== undefined)
        }
      }}
    />
  )
}

interface AmountForm {
  transactionCardStatus: TransactionCardStatus
  token: WalletToken
  onPress: () => void
  onAmountChange: (amount: string, type: AmountButtonTypes) => Promise<void>
}

function AmountCard ({
  transactionCardStatus,
  token,
  onPress,
  onAmountChange
}: AmountForm): JSX.Element {
  const maxAmount = BigNumber.max(token.amount, 0)
  return (
    <>
      <ThemedTextV2
        style={tailwind('pl-5 pb-2 text-xs font-normal-v2')}
        light={tailwind('text-mono-light-v2-500')}
        dark={tailwind('text-mono-dark-v2-500')}
      >{translate('screens/SendScreen', 'I WANT TO SEND')}
      </ThemedTextV2>
      <TransactionCard
        status={transactionCardStatus}
        maxValue={maxAmount}
        onChange={onAmountChange}
        containerStyle={tailwind('rounded-t-lg-v2')}
      >
        <ThemedTouchableOpacityV2
          style={tailwind('flex flex-row items-center justify-between pt-4.5 mb-4 mx-5')}
          onPress={onPress}
          testID='select_token_input'
        >
          <View style={tailwind('flex flex-row items-center')}>
            <TokenIcon
              testID={`${token.displaySymbol}_icon`} token={{
              isLPS: token.isLPS,
              displaySymbol: token.displaySymbol
            }} height={32} width={32}
            />
            <View style={tailwind('flex ml-2')}>
              <ThemedTextV2>
                <ThemedTextV2
                  style={tailwind('font-semibold-v2 text-sm')}
                  testID='max_value'
                >{maxAmount.toFixed(8)}
                </ThemedTextV2>
                <ThemedTextV2
                  style={tailwind('font-semibold-v2 text-sm')}
                  testID='max_value_display_symbol'
                >{` ${token.displaySymbol}`}
                </ThemedTextV2>
              </ThemedTextV2>
              <ThemedTextV2
                light={tailwind('text-mono-light-v2-500')}
                dark={tailwind('text-mono-dark-v2-500')}
                style={tailwind('text-xs font-normal-v2')}
              >{translate('screens/SendScreen', 'Available')}
              </ThemedTextV2>
            </View>
          </View>
          <ThemedIcon
            dark={tailwind('text-mono-dark-v2-700')}
            light={tailwind('text-mono-light-v2-700')}
            iconType='Feather'
            name='chevron-right'
            size={28}
          />
        </ThemedTouchableOpacityV2>
      </TransactionCard>
    </>
  )
}
