import { InputHelperText } from '@components/InputHelperText'
import { WalletTextInput } from '@components/WalletTextInput'
import { StackScreenProps } from '@react-navigation/stack'
import { DFITokenSelector, DFIUtxoSelector, fetchTokens, tokensSelector, WalletToken } from '@store/wallet'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Control, Controller, useForm } from 'react-hook-form'
import { Platform, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { AmountButtonTypes, SetAmountButton } from '@components/SetAmountButton'
import {
  ThemedIcon,
  ThemedScrollView,
  ThemedSectionTitle,
  ThemedText,
  ThemedTouchableOpacity,
  ThemedView
} from '@components/themed'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
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
import { BottomSheetToken, BottomSheetTokenList, TokenType } from '@components/BottomSheetTokenList'
import { BottomSheetFiatAccountList, FiatAccount } from '@components/BottomSheetFiatAccountList'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { SubmitButtonGroup } from '@components/SubmitButtonGroup'
import { useIsFocused } from '@react-navigation/native'
// import { useFeatureFlagContext } from '@contexts/FeatureFlagContext'
// import { isValidIBAN } from 'ibantools'

type Props = StackScreenProps<BalanceParamList, 'SellScreen'>

export function SellScreen ({
  route,
  navigation
}: Props): JSX.Element {
  const logger = useLogger()
  const client = useWhaleApiClient()
  const { address } = useWalletContext()
  const blockCount = useSelector((state: RootState) => state.block.count)
  const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))
  const [token, setToken] = useState(route.params?.token)
  const [fiatAccount, setFiatAccount] = useState<string>(/* TODO: route.params?.token */)
  const isFocused = useIsFocused()
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
  const [hasBalance, setHasBalance] = useState(false)

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
    if (isFocused) {
      dispatch(fetchTokens({
        client,
        address
      }))
    }
  }, [address, blockCount, isFocused])

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

    const totalBalance = tokens.reduce((total, token) => {
      return total.plus(new BigNumber(token.amount))
    }, new BigNumber(0))

    setHasBalance(totalBalance.isGreaterThan(0))
  }, [JSON.stringify(tokens)])

  const setFiatAccountListBottomSheet = useCallback(() => {
    setBottomSheetScreen([
      {
        stackScreenName: 'FiatAccountList',
        component: BottomSheetFiatAccountList({
          fiatAccounts: [new FiatAccount(), { iban: 'DE89 3704 0044 0532 0130 00' }, { iban: 'DE89 3I04 0044 0532 0130 00' }], // getBottomSheetToken(tokens),
          // tokenType: TokenType.BottomSheetToken,
          headerLabel: translate('screens/SellScreen', 'Choose account for payout'),
          onCloseButtonPress: () => dismissModal(),
          onFiatAccountPress: async (item): Promise<void> => {
            if (item.iban !== undefined) {
              setFiatAccount(item.iban)
              // setValue('amount', '')
              // await trigger('amount')
            }
            dismissModal()
          }
        }),
        option: {
          header: () => null
        }
      }])
  }, [])

  const setTokenListBottomSheet = useCallback(() => {
    setBottomSheetScreen([
      {
        stackScreenName: 'TokenList',
        component: BottomSheetTokenList({
          tokens: getBottomSheetToken(tokens),
          tokenType: TokenType.BottomSheetToken,
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
  }, [])

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
      <ThemedScrollView contentContainerStyle={tailwind('pt-6 pb-8')} testID='sell_screen'>
        <TokenInput
          token={token}
          onPress={() => {
            setTokenListBottomSheet()
            expandModal()
          }}
          isDisabled={!hasBalance}
        />

        {token === undefined
          ? (
            <ThemedText style={tailwind('px-4')}>
              {translate('screens/SellScreen', 'Select a token you want to sell to get started')}
            </ThemedText>
          )
          : (
            <>
              <View style={tailwind('px-4')}>
                <FiatAccountInput
                  onPress={() => {
                    setFiatAccountListBottomSheet()
                    expandModal()
                  }}
                  isDisabled={false} // TODO: only show if payment route exists
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
                      text={translate('screens/SellScreen', 'TRANSACTION DETAILS')}
                    />
                    {isConversionRequired &&
                      <NumberRow
                        lhs={translate('screens/SellScreen', 'UTXO to be converted')}
                        rhs={{
                          value: conversionAmount.toFixed(8),
                          testID: 'text_amount_to_convert',
                          suffixType: 'text',
                          suffix: token.displaySymbol
                        }}
                      />}

                    <FeeInfoRow
                      type='ESTIMATED_FEE'
                      value={`${fee.toString()} --> ${String(fiatAccount)}!`}
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
                  ? translate('screens/SellScreen', 'Authorize transaction in the next screen to convert')
                  : translate('screens/SellScreen', 'Review full transaction details in the next screen')}
              </ThemedText>
            </>
          )}

        <View style={tailwind('mt-6')}>
          <SubmitButtonGroup
            isDisabled={!formState.isValid || hasPendingJob || hasPendingBroadcastJob || token === undefined}
            label={translate('screens/SellScreen', 'CONTINUE')}
            processingLabel={translate('screens/SellScreen', 'CONTINUE')}
            onSubmit={onSubmit}
            title='sell_continue'
            isProcessing={hasPendingJob || hasPendingBroadcastJob}
            displayCancelBtn={false}
          />
        </View>

        {Platform.OS === 'web' && (
          <BottomSheetWebWithNav
            modalRef={containerRef}
            screenList={bottomSheetScreen}
            isModalDisplayed={isModalDisplayed}
            modalStyle={{
              position: 'absolute',
              height: '350px',
              width: '375px',
              zIndex: 50,
              bottom: '0'
            }}
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

function TokenInput (props: { token?: WalletToken, onPress: () => void, isDisabled: boolean }): JSX.Element {
  const hasNoBalanceForSelectedToken = props.token?.amount === undefined ? true : new BigNumber(props.token?.amount).lte(0)
  return (
    <View style={tailwind('px-4')}>
      <ThemedText
        testID='transaction_details_info_text'
        light={tailwind('text-gray-600')}
        dark={tailwind('text-dfxgray-300')}
        style={tailwind('text-xl font-semibold')}
      >
        {translate('screens/SellScreen', 'Sell token')}
      </ThemedText>
      {/* TODO */}
      <ThemedTouchableOpacity
        onPress={props.onPress}
        dark={tailwind('bg-dfxblue-800 border-dfxblue-900')}
        light={tailwind({
          'bg-gray-200 border-0': props.isDisabled,
          'border-gray-300 bg-white': !props.isDisabled
        })}
        style={tailwind('border rounded w-full flex flex-row justify-between h-12 items-center px-2', {
          'mb-10': props.token?.isLPS === false,
          'mb-2': props.token?.isLPS === true,
          'mb-6': props.token === undefined
        })}
        testID='select_token_input'
        disabled={props.isDisabled}
      >
        {props.token === undefined || props.isDisabled || hasNoBalanceForSelectedToken
          ? (
            <ThemedText
              dark={tailwind({
                'text-dfxgray-500': !props.isDisabled,
                'text-dfxblue-900': props.isDisabled
              })}
              style={tailwind('text-sm')}
              testID='select_token_placeholder'
            >
              {translate('screens/SellScreen', 'Select token')}
            </ThemedText>
          )
          : (
            <View style={tailwind('flex flex-row')}>
              <SymbolIcon symbol={props.token.displaySymbol} styleProps={tailwind('w-6 h-6')} />
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
          dark={tailwind({
            'text-dfxred-500': !props.isDisabled,
            'text-transparent': props.isDisabled
          })}
          light={tailwind({
            'text-primary-500': !props.isDisabled,
            'text-gray-500': props.isDisabled
          })}
          style={tailwind('-mr-1.5 flex-shrink-0')}
        />
      </ThemedTouchableOpacity>
    </View>
  )
}

function FiatAccountInput (props: { fiat?: FiatAccount, onPress: () => void, isDisabled: boolean }): JSX.Element {
  return (
    <>
      <ThemedText
        testID='transaction_details_info_text'
        light={tailwind('text-gray-600')}
        dark={tailwind('text-dfxgray-300')}
        style={tailwind('flex-grow')}
      >
        {translate('screens/SellScreen', 'Select account for payout')}
      </ThemedText>
      {/* TODO  -> came from SendScreen(fork) -> why? */}
      <ThemedTouchableOpacity
        onPress={props.onPress}
        dark={tailwind('bg-dfxblue-800 border-dfxblue-900')}
        light={tailwind({
          'bg-gray-200 border-0': props.isDisabled,
          'border-gray-300 bg-white': !props.isDisabled
        })}
        style={tailwind('border rounded w-full flex flex-row justify-between h-12 items-center px-2 mb-10')}
        testID='select_fiatAccount_input'
        disabled={props.isDisabled}
      >
        {props.fiat === undefined || props.isDisabled
          ? (
            <ThemedText
              dark={tailwind({
                'text-dfxgray-500': !props.isDisabled,
                'text-dfxblue-900': props.isDisabled
              })}
              style={tailwind('text-sm')}
              testID='select_fiatAccount_placeholder'
            >
              {translate('screens/SellScreen', 'Select fiat account')}
            </ThemedText>
          )
          : (
            <View style={tailwind('flex flex-row')}>
              {/* <SymbolIcon symbol={props.fiat.displaySymbol} styleProps={tailwind('w-6 h-6')} /> */}
              {/* isValidAddress: (iban) => isValidIBAN('NL91ABNA0517164300') // TODO: implement */}
              <ThemedText
                style={tailwind('ml-2 font-medium')}
                testID='selected_fiatAccount'
              >
                {props.fiat.iban}
              </ThemedText>
            </View>
          )}
        <ThemedIcon
          iconType='MaterialIcons'
          name='unfold-more'
          size={24}
          dark={tailwind({
            'text-dfxred-500': !props.isDisabled,
            'text-transparent': props.isDisabled
          })}
          light={tailwind({
            'text-primary-500': !props.isDisabled,
            'text-gray-500': props.isDisabled
          })}
          style={tailwind('-mr-1.5 flex-shrink-0')}
        />
      </ThemedTouchableOpacity>
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
              placeholder={translate('screens/SellScreen', 'Enter an amount')}
              style={tailwind('flex-grow w-2/5')}
              testID='amount_input'
              value={value}
              displayClearButton={value !== defaultValue}
              onClearButtonPress={onClearButtonPress}
              title={translate('screens/SellScreen', 'How much do you want to sell?')}
              titleTestID='title_sell'
              inputType='numeric'
            >
              <ThemedView
                dark={tailwind('bg-dfxblue-800')}
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
        label={`${translate('screens/SellScreen', 'Available')}: `}
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
        symbol: t.symbol,
        isLPS: t.isLPS
      }
    }
    return token
  })
}
