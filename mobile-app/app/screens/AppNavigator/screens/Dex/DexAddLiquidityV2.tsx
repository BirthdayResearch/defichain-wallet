import { InputHelperTextV2 } from '@components/InputHelperText'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import { View } from '@components'
import { ThemedScrollView, ThemedTextV2, ThemedViewV2 } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { DexParamList } from './DexNavigator'
import { DFITokenSelector, DFIUtxoSelector, tokensSelector, WalletToken } from '@store/wallet'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { hasTxQueued } from '@store/transaction_queue'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { queueConvertTransaction, useConversion } from '@hooks/wallet/Conversion'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { useAppDispatch } from '@hooks/useAppDispatch'
import { TransactionCard } from '@components/TransactionCard'
import { getNativeIcon } from '@components/icons/assets'
import { TransactionCardWalletTextInputV2 } from '@components/TransactionCardWalletTextInputV2'
import { PoolPairTextSectionV2 } from './components/PoolPairCards/PoolPairTextSectionV2'
import { SubmitButtonGroupV2 } from '@components/SubmitButtonGroupV2'
import { PricesSectionV2 } from '@components/PricesSectionV2'
import { useTokenPrice } from '../Portfolio/hooks/TokenPrice'
import { NumberRowV2 } from '@components/NumberRowV2'

type Props = StackScreenProps<DexParamList, 'AddLiquidity'>
type EditingAmount = 'primary' | 'secondary'

interface ExtPoolPairData extends PoolPairData {
  aSymbol: string
  bSymbol: string
  aToBRate: BigNumber
  bToARate: BigNumber
}

export function AddLiquidityScreenV2 (props: Props): JSX.Element {
  const logger = useLogger()
  const navigation = useNavigation<NavigationProp<DexParamList>>()
  const dispatch = useAppDispatch()
  const DFIToken = useSelector((state: RootState) => DFITokenSelector(state.wallet))
  const DFIUtxo = useSelector((state: RootState) => DFIUtxoSelector(state.wallet))
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const pairs = useSelector((state: RootState) => state.wallet.poolpairs)
  const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))
  const { getTokenPrice } = useTokenPrice()

  // transaction card component UI
  const [tokenATransactionCardStatus, setTokenATransactionCardStatus] = useState<'error' | 'active' | ' undefined'>()
  const [tokenBTransactionCardStatus, setTokenBTransactionCardStatus] = useState<'error' | 'active' | ' undefined'>()
  const [hasAError, setHasAError] = useState(false)
  const [hasBError, setHasBError] = useState(false)
  const [isInputAFocus, setIsInputAFocus] = useState(false)
  const [isInputBFocus, setIsInputBFocus] = useState(false)
  // const [convertUTXOMsg, setConvertUTXOMsg] = useState<boolean>(false) // TODO: waiting for the P's hook

  // this component UI state
  const [tokenAAmount, setTokenAAmount] = useState<string>('')
  const [tokenBAmount, setTokenBAmount] = useState<string>('')
  const [sharePercentage, setSharePercentage] = useState<BigNumber>(new BigNumber(0))
  const [canContinue, setCanContinue] = useState(false)

  // derived from props
  const [balanceA, setBalanceA] = useState(new BigNumber(0))
  const [balanceB, setBalanceB] = useState(new BigNumber(0))
  const [pair, setPair] = useState<ExtPoolPairData>()
  const {
    isConversionRequired,
    conversionAmount
  } = useConversion({
    inputToken: {
      type: 'token',
      amount: new BigNumber(pair?.tokenA.id === '0' ? tokenAAmount : tokenBAmount)
    },
    deps: [pair, tokenAAmount, tokenBAmount, balanceA, balanceB]
  })

  const buildSummary = useCallback((ref: EditingAmount, amountString: string): void => {
    const refAmount = amountString.length === 0 || isNaN(+amountString) ? new BigNumber(0) : new BigNumber(amountString)
    if (pair === undefined) {
      return
    }
    if (ref === 'primary') {
      setTokenAAmount(amountString)
      setTokenBAmount(refAmount.times(pair.aToBRate).toFixed(8))
      setSharePercentage(refAmount.div(pair.tokenA.reserve))
    } else {
      setTokenBAmount(amountString)
      setTokenAAmount(refAmount.times(pair.bToARate).toFixed(8))
      setSharePercentage(refAmount.div(pair.tokenB.reserve))
    }
  }, [pair])

  const getAddressTokenById = (poolpairTokenId: string): WalletToken | undefined => {
    return tokens.find(token => {
      if (poolpairTokenId === '0' || poolpairTokenId === '0_utxo') {
        return token.id === '0_unified'
      }
      return token.id === poolpairTokenId
    })
  }

  async function onSubmit (): Promise<void> {
    if (hasPendingJob || hasPendingBroadcastJob) {
      return
    }

    if (!canContinue || pair === undefined) {
      return
    }

    if (isConversionRequired) {
      queueConvertTransaction({
        mode: 'utxosToAccount',
        amount: conversionAmount
      }, dispatch, () => {
        navigation.navigate({
          name: 'ConfirmAddLiquidity',
          params: {
            summary: {
              fee: new BigNumber(0.0001),
              tokenAAmount: new BigNumber(tokenAAmount),
              tokenBAmount: new BigNumber(tokenBAmount),
              percentage: sharePercentage,
              tokenABalance: balanceA,
              tokenBBalance: balanceB
            },
            pair,
            conversion: {
              isConversionRequired,
              DFIToken,
              DFIUtxo,
              conversionAmount
            }
          },
          merge: true
        })
      }, logger)
    } else {
      navigation.navigate({
        name: 'ConfirmAddLiquidity',
        params: {
          summary: {
            fee: new BigNumber(0.0001),
            tokenAAmount: new BigNumber(tokenAAmount),
            tokenBAmount: new BigNumber(tokenBAmount),
            percentage: sharePercentage,
            tokenABalance: balanceA,
            tokenBBalance: balanceB
          },
          pair
        },
        merge: true
      })
    }
  }

  useEffect(() => {
    if (new BigNumber(tokenAAmount).isGreaterThan(balanceA)) {
      setHasAError(true)
    } else {
      setHasAError(false)
    }
  }, [tokenAAmount, balanceA])

  useEffect(() => {
    if (new BigNumber(tokenBAmount).isGreaterThan(balanceB)) {
      setHasBError(true)
    } else {
      setHasBError(false)
    }
  }, [tokenBAmount, balanceB])

  useEffect(() => {
    setTokenATransactionCardStatus(hasAError ? 'error' : isInputAFocus ? 'active' : undefined)
    setTokenBTransactionCardStatus(hasBError ? 'error' : isInputBFocus ? 'active' : undefined)
  }, [hasAError, hasBError, isInputAFocus, isInputBFocus])

  useEffect(() => {
    if (pair === undefined) {
      return
    }
    setCanContinue(canAddLiquidity(
      pair,
      new BigNumber(tokenAAmount),
      new BigNumber(tokenBAmount),
      balanceA,
      balanceB
    ))
  }, [pair, tokenAAmount, tokenBAmount, balanceA, balanceB])

  // prop/global state change
  useEffect(() => {
    const { pair: poolPairData } = props.route.params
    const poolpair = pairs.find((p) => p.data.id === poolPairData.id)?.data
    const reservedDfi = 0.1
    if (poolpair !== undefined) {
      const [aSymbol, bSymbol] = poolpair.symbol.split('-')
      const addressTokenA = getAddressTokenById(poolpair.tokenA.id)
      const addressTokenB = getAddressTokenById(poolpair.tokenB.id)

      // side effect to state
      setPair({
        ...poolpair,
        aSymbol,
        bSymbol,
        aToBRate: new BigNumber(poolpair.tokenB.reserve).div(poolpair.tokenA.reserve),
        bToARate: new BigNumber(poolpair.tokenA.reserve).div(poolpair.tokenB.reserve)
      })
      if (addressTokenA !== undefined) {
        setBalanceA(addressTokenA.id === '0_unified' ? new BigNumber(addressTokenA.amount).minus(reservedDfi) : new BigNumber(addressTokenA.amount))
      }
      if (addressTokenB !== undefined) {
        setBalanceB(addressTokenB.id === '0_unified' ? new BigNumber(addressTokenB.amount).minus(reservedDfi) : new BigNumber(addressTokenB.amount))
      }
    }
  }, [props.route.params.pair, JSON.stringify(tokens), pairs])

  if (pair === undefined) {
    return <></>
  }

  const lmTokenAmount = sharePercentage.times(pair.totalLiquidity.token)
  const sharesUsdAmount = getTokenPrice(pair.aSymbol, new BigNumber(tokenAAmount)).plus(getTokenPrice(pair.aSymbol, new BigNumber(tokenBAmount)))

  return (
    <ThemedScrollView contentContainerStyle={tailwind('py-8')} style={tailwind('w-full')}>
      <View style={tailwind('px-5')}>
        <View style={tailwind('items-center pb-6')}>
          <View style={tailwind('flex-row pb-2')}>
            <PoolPairTextSectionV2
              symbolA={pair?.tokenA?.displaySymbol}
              symbolB={pair?.tokenB?.displaySymbol}
              customSize={56}
            />
          </View>
          <ThemedTextV2
            style={tailwind('text-lg font-semibold-v2')}
          >
            {pair?.displaySymbol}
          </ThemedTextV2>
        </View>

        <DexInputCard
          balance={balanceA}
          current={tokenAAmount}
          onChange={(amount) => {
            buildSummary('primary', amount)
          }}
          symbol={pair?.tokenA?.displaySymbol}
          type='primary'
          setIsInputFocus={setIsInputAFocus}
          status={tokenATransactionCardStatus}
          showErrMsg={hasAError}
        />

        <DexInputCard
          balance={balanceB}
          current={tokenBAmount}
          onChange={(amount) => {
            buildSummary('secondary', amount)
          }}
          symbol={pair?.tokenB?.displaySymbol}
          type='secondary'
          setIsInputFocus={setIsInputBFocus}
          status={tokenBTransactionCardStatus}
          showErrMsg={hasBError}
        />

        {/* TODO: do a hook for text input */}
        {/* <ReservedDFIInfoText />
        {
          isConversionRequired &&
          <View style={tailwind('pt-2')}>
            <ConversionInfoText />
          </View>
        } */}
      </View>

      <View style={tailwind('pb-2 px-5')}>
        <ThemedViewV2
          light={tailwind('border-mono-light-v2-300')}
          dark={tailwind('border-mono-dark-v2-300')}
          style={tailwind('px-5 pt-5 border rounded-2xl-v2')}
        >
          <PricesSectionV2
            key='prices'
            testID='pricerate_value'
            priceRates={[{
              label: translate('components/PricesSection', '1 {{token}} =', {
                token: pair.tokenA.displaySymbol
              }),
              value: pair.aToBRate.toFixed(8),
              aSymbol: pair.tokenA.displaySymbol,
              bSymbol: pair.tokenB.displaySymbol,
              symbolUSDValue: getTokenPrice(pair.bSymbol, pair.aToBRate),
              usdTextStyle: tailwind('text-sm')
            },
            {
              label: translate('components/PricesSection', '1 {{token}} =', {
                token: pair.tokenB.displaySymbol
              }),
              value: pair.bToARate.toFixed(8),
              aSymbol: pair.tokenB.displaySymbol,
              bSymbol: pair.tokenA.displaySymbol,
              symbolUSDValue: getTokenPrice(pair.aSymbol, pair.bToARate),
              usdTextStyle: tailwind('text-sm')
            }
            ]}
          />
          <ThemedViewV2
            light={tailwind('border-mono-light-v2-300')}
            dark={tailwind('border-mono-dark-v2-300')}
            style={tailwind('pt-5 border-t-0.5')}
          >
            <NumberRowV2
              lhs={{
                value: translate('components/PricesSection', 'Shares to add'), // TODO: update label upon confirmation
                testID: 'shares_to_add',
                lightTextStyle: tailwind('text-mono-light-v2-500'),
                darkTextStyle: tailwind('text-mono-dark-v2-500')
              }}
              rhs={{
                value: lmTokenAmount.toFixed(8),
                testID: 'shares_to_add_value',
                usdAmount: sharesUsdAmount.isNaN() ? new BigNumber(0) : sharesUsdAmount,
                textStyle: tailwind('font-bold-v2'),
                usdTextStyle: tailwind('text-sm')
              }}
            />
          </ThemedViewV2>
        </ThemedViewV2>
      </View>

      <View style={tailwind('items-center')}>
        <ThemedTextV2
          testID='transaction_details_hint_text'
          light={tailwind('text-mono-light-v2-500')}
          dark={tailwind('text-mono-dark-v2-500')}
          style={tailwind('text-xs font-normal-v2 pt-4')}
        >
          {isConversionRequired
            ? translate('screens/AddLiquidity', 'Authorize transaction in the next screen to convert')
            : translate('screens/AddLiquidity', 'Review full details in the next screen')}
        </ThemedTextV2>
      </View>

      <View style={tailwind('mx-8')}>
        <ContinueButton
          isProcessing={hasPendingJob || hasPendingBroadcastJob}
          enabled={canContinue}
          onPress={onSubmit}
        />
      </View>
    </ThemedScrollView>
  )
}

function DexInputCard (
  props: {
    balance: BigNumber
    type: 'primary' | 'secondary'
    symbol: string
    onChange: (amount: string) => void
    current: string
    status?: string
    setIsInputFocus: any // TODO: double check type
    showErrMsg: boolean
  }): JSX.Element {
  const Icon = getNativeIcon(props.symbol)
  const isFocus = props.setIsInputFocus
  return (
    <>
      <TransactionCard
        maxValue={props.balance}
        onChange={(amount) => {
          props.onChange(amount)
        }}
        status={props.status}
      >
        <ThemedViewV2
          light={tailwind('border-mono-light-v2-300')}
          dark={tailwind('border-mono-dark-v2-300')}
          style={tailwind('flex flex-row items-center py-2')}
        >
          <Icon height={20} width={20} />
          <TransactionCardWalletTextInputV2
            onFocus={isFocus}
            onBlur={isFocus}
            onChangeText={txt => props.onChange(txt)}
            placeholder='0.00'
            style={tailwind('flex-grow w-2/5')}
            value={props.current}
            inputType='numeric'
            displayClearButton={props.current !== ''}
            onClearButtonPress={() => props.onChange('')}
            titleTestID={`token_input_${props.type}_title`}
            testID={`token_input_${props.type}`}
          />
        </ThemedViewV2>
      </TransactionCard>

      <View style={tailwind('pt-0.5 pb-6')}>
        {props.showErrMsg
          ? (
            <ThemedTextV2
              light={tailwind('text-red-v2')}
              dark={tailwind('text-red-v2')}
              style={tailwind('px-4 text-sm')}
            >
              {`${translate('screens/AddLiquidity', 'Insufficient balance')}`}
            </ThemedTextV2>
          )
          : (
            <InputHelperTextV2
              testID={`token_balance_${props.type}`}
              label={`${translate('screens/AddLiquidity', 'Available')}: `}
              content={BigNumber.max(props.balance, 0).toFixed(8)}
              suffix={` ${props.symbol}`}
            />
          )}
      </View>
    </>
  )
}

function ContinueButton (props: { enabled: boolean, onPress: () => Promise<void>, isProcessing: boolean }): JSX.Element {
  return (
    <SubmitButtonGroupV2
      isDisabled={!props.enabled}
      label={translate('components/Button', 'CONTINUE')}
      processingLabel={translate('components/Button', 'CONTINUE')}
      onSubmit={props.onPress}
      title='continue_add_liq'
      isProcessing={props.isProcessing}
      displayCancelBtn={false}
    />
  )
}

// just leave it as it is now, will be moved to network drawer
function canAddLiquidity (pair: ExtPoolPairData, tokenAAmount: BigNumber, tokenBAmount: BigNumber, balanceA: BigNumber | undefined, balanceB: BigNumber | undefined): boolean {
  if (tokenAAmount.isNaN() || tokenBAmount.isNaN()) {
    // empty string, use still input-ing
    return false
  }

  if (tokenAAmount.lte(0) || tokenBAmount.lte(0)) {
    return false
  }

  if (tokenAAmount.gt(pair.tokenA.reserve) || tokenBAmount.gt(pair.tokenB.reserve)) {
    return false
  }

  return !(balanceA === undefined || balanceA.lt(tokenAAmount) ||
    balanceB === undefined || balanceB.lt(tokenBAmount))
}
