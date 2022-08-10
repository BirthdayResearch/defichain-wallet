import { DeFiAddress } from '@defichain/jellyfish-address'
import { NetworkName } from '@defichain/jellyfish-network'
import { StackScreenProps } from '@react-navigation/stack'
import { DFITokenSelector, DFIUtxoSelector, tokensSelector, WalletToken } from '@store/wallet'
import BigNumber from 'bignumber.js'
import { useEffect, useState, useMemo } from 'react'
import { Control, Controller, useForm } from 'react-hook-form'
import { Platform, View } from 'react-native'
import { useSelector } from 'react-redux'
import {
  ThemedIcon,
  ThemedScrollView,
  ThemedText,
  ThemedTextInputV2,
  ThemedTextV2,
  ThemedTouchableOpacity,
  ThemedTouchableOpacityV2,
  ThemedView
} from '@components/themed'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { RootState } from '@store'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { hasTxQueued } from '@store/transaction_queue'
import { getColor, tailwind } from '@tailwind'
import { translate } from '@translations'
import { PortfolioParamList } from '../PortfolioNavigator'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { queueConvertTransaction, useConversion } from '@hooks/wallet/Conversion'
import { debounce } from 'lodash'
import { useAppDispatch } from '@hooks/useAppDispatch'
import { getNativeIcon } from '@components/icons/assets'
import { WalletTextInputV2 } from '@components/WalletTextInputV2'
import { SubmitButtonGroupV2 } from '@components/SubmitButtonGroupV2'
import { TransactionCard } from '@components/TransactionCard'
import { useWalletAddress } from '@hooks/useWalletAddress'
import { LocalAddress } from '@store/userPreferences'
import { useTokenPrice } from '../hooks/TokenPrice'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { ActiveUSDValueV2 } from '../../Loans/VaultDetail/components/ActiveUSDValueV2'
import { useDisplayUtxoWarning } from '@hooks/wallet/DisplayUtxoWarning'

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

  // form
  const { control, setValue, formState, getValues, trigger, watch } = useForm({ mode: 'onChange' })
  const { address } = watch()
  const amountToSend = getValues('amount')

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
    } else if (address !== undefined && walletAddress !== undefined && walletAddress[address] !== undefined) {
      setMatchedAddress(walletAddress[address])
    } else if (address !== undefined && jellyfishWalletAddress.includes(address)) {
      // wallet address that does not have a label
      setMatchedAddress({
        address,
        label: 'Saved address',
        isMine: true
      })
    } else {
      setMatchedAddress(undefined)
    }
  }, 200)

  const reservedDFI = 0.1
  const isReservedUtxoUsed = getDisplayUtxoWarningStatus(new BigNumber(amountToSend))
  const amountInUSDValue = useMemo(() => {
    if (token === undefined || isNaN(amountToSend) || (amountToSend === '')) {
      return new BigNumber(0)
    }

    return getTokenPrice(token.symbol, amountToSend, token.isLPS)
  }, [amountToSend, token])

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
      setToken({ ...t, amount: t.displaySymbol === 'DFI' ? new BigNumber(t.amount).minus(reservedDFI).toFixed(8) : t.amount })
    }
  }, [JSON.stringify(tokens)])

  useEffect(() => {
    debounceMatchAddress()
  }, [address, addressBook])

  async function onSubmit (): Promise<void> {
    if (hasPendingJob || hasPendingBroadcastJob || token === undefined || !formState.isValid) {
      return
    }

    const values = getValues()
    const params: PortfolioParamList['SendConfirmationScreen'] = {
      destination: values.address,
      token,
      amount: new BigNumber(values.amount),
      fee
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
          name: 'SendConfirmationScreen',
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
          name: 'SendConfirmationScreen',
          params,
          merge: true
        })
      })
    } else {
      navigation.navigate({
        name: 'SendConfirmationScreen',
        params,
        merge: true
      })
    }
  }

  return (
    <View style={tailwind('h-full')}>
      <ThemedScrollView contentContainerStyle={tailwind('pt-6 pb-8')} testID='send_screen'>
        {token === undefined
          ? (
            <ThemedText style={tailwind('px-5')}>
              {translate('screens/SendScreen', 'Select a token you want to send to get started')}
            </ThemedText>
          )
          : (
            <>
              <View style={tailwind('px-5')}>
                <View style={tailwind('my-12 items-center')}>
                  <Controller
                    control={control}
                    defaultValue='0'
                    name='amount'
                    render={({
                      field: {
                        onChange,
                        value
                      }
                    }) => (
                      <ThemedTextInputV2
                        style={tailwind('text-3xl outline-0 text-center')}
                        light={tailwind('text-mono-light-v2-900')}
                        dark={tailwind('text-mono-dark-v2-900')}
                        keyboardType='numeric'
                        value={value}
                        onChange={onChange}
                        placeholder='0'
                        placeholderTextColor={getColor(isLight ? 'mono-light-v2-900' : 'mono-dark-v2-900')}
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
                  <ActiveUSDValueV2 price={amountInUSDValue} />
                </View>

                <AmountCard
                  onPress={() => {
                    navigation.navigate({
                      name: 'TokenSelectionScreen',
                      params: {},
                      merge: true
                    })
                  }}
                  onAmountChange={async (amount) => {
                    setValue('amount', amount, { shouldDirty: true })
                    await trigger('amount')
                  }}
                  token={token}
                />

                {token?.isLPS && new BigNumber(amountToSend).isGreaterThan(0)
                  ? (
                    <ThemedTextV2
                      style={tailwind('text-xs mt-2 ml-5')}
                      dark={tailwind('text-orange-v2')}
                      light={tailwind('text-orange-v2')}
                      testID='lp_info_text'
                    >
                      Make sure to send your LP Tokens to only DeFiChain-compatible wallets. Failing to do so may lead to irreversible loss of funds
                    </ThemedTextV2>
                  )
                  : isReservedUtxoUsed
                    ? (
                      <ThemedTextV2
                        style={tailwind('text-xs mt-2 ml-5')}
                        dark={tailwind('text-orange-v2')}
                        light={tailwind('text-orange-v2')}
                      >
                        A small amount of UTXO is reserved for fees
                      </ThemedTextV2>
                    )
                    : (
                      <ThemedTextV2
                        style={tailwind('text-xs mt-2 ml-5')}
                        light={tailwind('text-mono-light-v2-500')}
                        dark={tailwind('text-mono-dark-v2-500')}
                      >
                        There is a minimal fee for the transaction
                      </ThemedTextV2>
                    )}
                <AddressRow
                  control={control}
                  networkName={networkName}
                  onContactButtonPress={() => navigation.navigate({
                    name: 'AddressBookScreen',
                    params: {
                      selectedAddress: getValues('address'),
                      onAddressSelect: async (savedAddres: string) => {
                        setValue('address', savedAddres, { shouldDirty: true })
                        await trigger('address')
                        navigation.goBack()
                      }
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
                  inputFooter={
                    <>
                      {matchedAddress !== undefined && (
                        <ThemedView
                          style={tailwind('mx-2 mb-2 p-1 rounded-2xl flex flex-row self-start', { 'items-end': Platform.OS === 'ios' })}
                          light={tailwind('bg-gray-50')}
                          dark={tailwind('bg-gray-900')}
                        >
                          <ThemedIcon
                            name='account-check'
                            iconType='MaterialCommunityIcons'
                            size={18}
                            light={tailwind('text-gray-400')}
                            dark={tailwind('text-gray-500')}
                          />
                          <ThemedText
                            style={tailwind('text-xs ml-1 pt-px')}
                            light={tailwind('text-gray-500')}
                            dark={tailwind('text-gray-400')}
                            testID='address_input_footer'
                          >
                            {matchedAddress.label}
                          </ThemedText>
                        </ThemedView>
                      )}
                    </>
                  }
                />
              </View>
            </>
          )}

        <View style={tailwind('mt-24 mx-12 items-center')}>
          {(formState.isValid && token !== undefined) &&
            <ThemedText
              testID='transaction_details_info_text'
              light={tailwind('text-mono-light-v2-500')}
              dark={tailwind('text-mono-dark-v2-500')}
              style={tailwind('mt-2 text-xs text-center')}
            >
              {isConversionRequired
                ? translate('screens/SendScreen', 'By continuing, the required amount of DFI will be converted')
                : translate('screens/SendScreen', 'Review full transaction details in the next screen')}
            </ThemedText>}
          <SubmitButtonGroupV2
            isDisabled={!formState.isValid || hasPendingJob || hasPendingBroadcastJob || token === undefined}
            label={translate('screens/SendScreen', 'CONTINUE')}
            onSubmit={onSubmit}
            title='send_continue'
            displayCancelBtn={false}
            buttonStyle='mt-5'
          />
        </View>
      </ThemedScrollView>
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
          <View style={tailwind('flex-row w-full')}>
            <WalletTextInputV2
              autoCapitalize='none'
              multiline
              onChange={onChange}
              onChangeText={onAddressChange}
              placeholder={translate('screens/SendScreen', 'Paste address')}
              style={tailwind('w-3/5 flex-grow pb-1')}
              testID='address_input'
              value={value}
              displayClearButton={value !== defaultValue}
              onClearButtonPress={onClearButtonPress}
              title={translate('screens/SendScreen', 'SEND TO')}
              titleTestID='title_to_address'
              inputType='default'
              inputFooter={inputFooter}
            >
              <ThemedTouchableOpacity
                dark={tailwind('bg-black')}
                light={tailwind('bg-white')}
                onPress={onContactButtonPress}
                style={tailwind('w-9 p-1.5 mr-1 rounded')}
                testID='address_book_button'
              >
                <ThemedIcon
                  iconType='MaterialCommunityIcons'
                  dark={tailwind('text-mono-dark-v2-700')}
                  light={tailwind('text-mono-light-v2-700')}
                  name='account-multiple'
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
            </WalletTextInputV2>
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
  token: WalletToken
  onPress: () => void
  onAmountChange: (amount: string) => Promise<void>
}

function AmountCard ({
  token,
  onPress,
  onAmountChange
}: AmountForm): JSX.Element {
  const maxAmount = BigNumber.max(token.amount, 0)
  const Icon = getNativeIcon(token.displaySymbol)
  return (
    <>
      <ThemedTextV2
        style={tailwind('pl-5 pb-2 text-xs font-normal-v2')}
        light={tailwind('text-mono-light-v2-500')}
        dark={tailwind('text-mono-dark-v2-500')}
      >I WANT TO SEND
      </ThemedTextV2>
      <TransactionCard
        maxValue={maxAmount}
        onChange={onAmountChange}
      >
        <ThemedTouchableOpacityV2
          style={tailwind('flex flex-row items-center justify-between px-5 pt-5 mb-2 pb-2')}
          onPress={onPress}
        >
          <View style={tailwind('flex flex-row items-center')}>
            <Icon height={32} width={32} />
            <View style={tailwind('flex ml-2')}>
              <ThemedTextV2 style={tailwind('font-bold')}>{`${maxAmount.toFixed(8)} ${token.displaySymbol}`}</ThemedTextV2>
              <ThemedTextV2
                light={tailwind('text-mono-light-v2-500')}
                dark={tailwind('text-mono-dark-v2-500')}
                style={tailwind('text-xs')}
              >Available
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
