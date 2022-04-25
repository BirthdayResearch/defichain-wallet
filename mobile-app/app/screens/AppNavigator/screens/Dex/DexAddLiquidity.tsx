import { InputHelperText } from '@components/InputHelperText'
import { WalletTextInput } from '@components/WalletTextInput'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { NavigationProp, useIsFocused, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import { View } from '@components'
import { NumberRow } from '@components/NumberRow'
import { AmountButtonTypes, SetAmountButton } from '@components/SetAmountButton'
import { ThemedScrollView, ThemedSectionTitle, ThemedText, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { DexParamList } from './DexNavigator'
import { FeeInfoRow } from '@components/FeeInfoRow'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { DFITokenSelector, DFIUtxoSelector, fetchTokens, tokensSelector, WalletToken } from '@store/wallet'
import { ConversionInfoText } from '@components/ConversionInfoText'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@store'
import { hasTxQueued } from '@store/transaction_queue'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { ReservedDFIInfoText } from '@components/ReservedDFIInfoText'
import { queueConvertTransaction, useConversion } from '@hooks/wallet/Conversion'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { SubmitButtonGroup } from '@components/SubmitButtonGroup'

type Props = StackScreenProps<DexParamList, 'AddLiquidity'>
type EditingAmount = 'primary' | 'secondary'

interface ExtPoolPairData extends PoolPairData {
  aSymbol: string
  bSymbol: string
  aToBRate: BigNumber
  bToARate: BigNumber
}

export function AddLiquidityScreen (props: Props): JSX.Element {
  const logger = useLogger()
  const navigation = useNavigation<NavigationProp<DexParamList>>()
  const client = useWhaleApiClient()
  const { address } = useWalletContext()
  const dispatch = useDispatch()
  const isFocused = useIsFocused()
  const DFIToken = useSelector((state: RootState) => DFITokenSelector(state.wallet))
  const DFIUtxo = useSelector((state: RootState) => DFIUtxoSelector(state.wallet))
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const blockCount = useSelector((state: RootState) => state.block.count)
  const pairs = useSelector((state: RootState) => state.wallet.poolpairs)
  const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))

  // this component UI state
  const [tokenAAmount, setTokenAAmount] = useState<string>('')
  const [tokenBAmount, setTokenBAmount] = useState<string>('')
  const [sharePercentage, setSharePercentage] = useState<BigNumber>(new BigNumber(0))
  const [canContinue, setCanContinue] = useState(false)
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001))

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
    if (isFocused) {
      dispatch(fetchTokens({ client, address }))
    }
  }, [address, blockCount, isFocused])

  useEffect(() => {
    client.fee.estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(logger.error)
  }, [])

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

  return (
    <ThemedScrollView contentContainerStyle={tailwind('py-8')} style={tailwind('w-full flex-col flex-1')}>
      <View style={tailwind('px-4')}>
        <TokenInput
          balance={balanceA}
          current={tokenAAmount}
          onChange={(amount) => {
            buildSummary('primary', amount)
          }}
          symbol={pair?.tokenA?.displaySymbol}
          type='primary'
        />

        <TokenInput
          balance={balanceB}
          current={tokenBAmount}
          onChange={(amount) => {
            buildSummary('secondary', amount)
          }}
          symbol={pair?.tokenB?.displaySymbol}
          type='secondary'
        />
        <ReservedDFIInfoText />
        {isConversionRequired &&
          <View style={tailwind('mt-2')}>
            <ConversionInfoText />
          </View>}
      </View>

      <PriceDetailsSection
        pair={pair}
      />
      <TransactionDetailsSection
        pair={pair}
        sharePercentage={sharePercentage}
        fee={fee}
        isConversionRequired={isConversionRequired}
        amountToConvert={conversionAmount}
      />

      <ThemedText
        testID='transaction_details_hint_text'
        light={tailwind('text-gray-600')}
        dark={tailwind('text-gray-300')}
        style={tailwind('pt-4 pb-8 px-4 text-sm')}
      >
        {isConversionRequired
          ? translate('screens/AddLiquidity', 'Authorize transaction in the next screen to convert')
          : translate('screens/AddLiquidity', 'Review full transaction details in the next screen')}
      </ThemedText>

      <ContinueButton
        isProcessing={hasPendingJob || hasPendingBroadcastJob}
        enabled={canContinue}
        onPress={onSubmit}
      />
    </ThemedScrollView>
  )
}

function TokenInput (props: { symbol: string, balance: BigNumber, current: string, type: EditingAmount, onChange: (amount: string) => void }): JSX.Element {
  return (
    <ThemedView
      dark={tailwind('bg-transparent')}
      light={tailwind('bg-transparent')}
      style={tailwind('flex-col w-full')}
    >
      <WalletTextInput
        onChangeText={txt => props.onChange(txt)}
        placeholder={translate('screens/AddLiquidity', 'Enter an amount')}
        style={tailwind('flex-grow w-2/5')}
        testID={`token_input_${props.type}`}
        value={props.current}
        title={translate('screens/AddLiquidity', 'How much {{symbol}} to supply?', { symbol: props.symbol })}
        titleTestID={`token_input_${props.type}_title`}
        inputType='numeric'
        displayClearButton={props.current !== ''}
        onClearButtonPress={() => props.onChange('')}
      >
        <SetAmountButton
          amount={props.balance}
          onPress={props.onChange}
          type={AmountButtonTypes.half}
        />
        <SetAmountButton
          amount={props.balance}
          onPress={props.onChange}
          type={AmountButtonTypes.max}
        />
      </WalletTextInput>
      <InputHelperText
        testID={`token_balance_${props.type}`}
        label={`${translate('screens/AddLiquidity', 'Available')}: `}
        content={BigNumber.max(props.balance, 0).toFixed(8)}
        suffix={` ${props.symbol}`}
      />
    </ThemedView>
  )
}

function PriceDetailsSection (props: { pair: ExtPoolPairData }): JSX.Element {
  const { pair } = props
  return (
    <>
      <ThemedSectionTitle
        testID='title_price_detail'
        text={translate('screens/AddLiquidity', 'PRICE DETAILS')}
        style={tailwind('px-4 pt-6 pb-2 text-xs text-gray-500 font-medium')}
      />
      <NumberRow
        lhs={translate('screens/AddLiquidity', '{{tokenA}} price per {{tokenB}}', {
          tokenA: pair.tokenA.displaySymbol,
          tokenB: pair.tokenB.displaySymbol
        })}
        rhs={{
          value: pair.bToARate.toFixed(8),
          testID: 'a_per_b_price',
          suffixType: 'text',
          suffix: pair.tokenA.displaySymbol
        }}
      />
      <NumberRow
        lhs={translate('screens/AddLiquidity', '{{tokenA}} price per {{tokenB}}', {
          tokenA: pair.tokenB.displaySymbol,
          tokenB: pair.tokenA.displaySymbol
        })}
        rhs={{
          value: pair.aToBRate.toFixed(8),
          testID: 'b_per_a_price',
          suffixType: 'text',
          suffix: pair.tokenB.displaySymbol
        }}
      />
    </>
  )
}

function TransactionDetailsSection (props: { pair: ExtPoolPairData, sharePercentage: BigNumber, fee: BigNumber, isConversionRequired: boolean, amountToConvert: BigNumber }): JSX.Element {
  const {
    pair,
    sharePercentage,
    isConversionRequired
  } = props

  return (
    <>
      <ThemedSectionTitle
        testID='title_add_detail'
        text={translate('screens/AddLiquidity', 'TRANSACTION DETAILS')}
      />
      {isConversionRequired &&
        <NumberRow
          lhs={translate('screens/AddLiquidity', 'UTXO to be converted')}
          rhs={{
          value: props.amountToConvert.toFixed(8),
          testID: 'text_amount_to_convert',
          suffixType: 'text',
          suffix: 'DFI'
        }}
        />}
      <NumberRow
        lhs={translate('screens/AddLiquidity', 'Share of pool')}
        rhs={{
          value: sharePercentage.times(100).toFixed(8),
          suffix: '%',
          testID: 'share_of_pool',
          suffixType: 'text'
        }}
      />

      <NumberRow
        lhs={translate('screens/AddLiquidity', 'Pooled {{symbol}}', { symbol: pair?.tokenA?.displaySymbol })}
        rhs={{
          value: pair.tokenA.reserve,
          testID: `pooled_${pair?.tokenA?.displaySymbol}`,
          suffixType: 'text',
          suffix: pair?.tokenA?.displaySymbol
        }}
      />

      <NumberRow
        lhs={translate('screens/AddLiquidity', 'Pooled {{symbol}}', { symbol: pair?.tokenB?.displaySymbol })}
        rhs={{
          value: pair.tokenB.reserve,
          testID: `pooled_${pair?.tokenB?.displaySymbol}`,
          suffixType: 'text',
          suffix: pair?.tokenB?.displaySymbol
        }}
      />
      <FeeInfoRow
        type='ESTIMATED_FEE'
        value={props.fee.toFixed(8)}
        testID='text_fee'
        suffix='DFI'
      />
    </>
  )
}

function ContinueButton (props: { enabled: boolean, onPress: () => Promise<void>, isProcessing: boolean }): JSX.Element {
  return (
    <SubmitButtonGroup
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
