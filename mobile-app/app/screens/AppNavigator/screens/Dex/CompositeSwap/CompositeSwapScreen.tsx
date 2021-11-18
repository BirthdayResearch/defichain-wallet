import React, { useCallback, useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import { useSelector } from 'react-redux'
import { Control, Controller, useForm } from 'react-hook-form'
import BigNumber from 'bignumber.js'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { tailwind } from '@tailwind'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { translate } from '@translations'
import { RootState } from '@store'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { hasTxQueued } from '@store/transaction_queue'
import { DexItem, DFITokenSelector, DFIUtxoSelector } from '@store/wallet'
import { usePoolPairsAPI } from '@hooks/wallet/PoolPairsAPI'
import { useConversion } from '@hooks/wallet/Conversion'
import { useTokensAPI } from '@hooks/wallet/TokensAPI'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import {
  ThemedIcon,
  ThemedScrollView,
  ThemedSectionTitle,
  ThemedText,
  ThemedTouchableOpacity, ThemedView
} from '@components/themed'
import { getNativeIcon } from '@components/icons/assets'
import { BottomSheetNavScreen, BottomSheetWithNav } from '@components/BottomSheetWithNav'
import { BottomSheetToken, BottomSheetTokenList } from './components/BottomSheetTokenList'
import { Button } from '@components/Button'
import { ConversionInfoText } from '@components/ConversionInfoText'
import { FeeInfoRow } from '@components/FeeInfoRow'
import { InputHelperText } from '@components/InputHelperText'
import { NumberRow } from '@components/NumberRow'
import { PriceRateProps, PricesSection } from './components/PricesSection'
import { AmountButtonTypes, SetAmountButton } from '@components/SetAmountButton'
import { TextRow } from '@components/TextRow'
import { WalletTextInput } from '@components/WalletTextInput'
import { SlippageTolerance } from '../PoolSwap/components/SlippageTolerance'
import { DexParamList } from '../DexNavigator'

export interface DerivedTokenState {
  id: string
  amount: string
  displaySymbol: string
  symbol: string
}

export function CompositeSwapScreen (): JSX.Element {
  const logger = useLogger()
  const pairs = usePoolPairsAPI()
  const tokens = useTokensAPI()
  const client = useWhaleApiClient()
  const navigation = useNavigation<NavigationProp<DexParamList>>()

  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const DFIToken = useSelector((state: RootState) => DFITokenSelector(state.wallet))
  const DFIUtxo = useSelector((state: RootState) => DFIUtxoSelector(state.wallet))

  const reservedDfi = 0.1
  const [bottomSheetScreen, setBottomSheetScreen] = useState<BottomSheetNavScreen[]>([])
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001))
  const [selectedTokenA, setSelectedTokenA] = useState<DerivedTokenState>()
  const [selectedTokenB, setSelectedTokenB] = useState<DerivedTokenState>()
  const [selectedPoolPairs, setSelectedPoolPairs] = useState<PoolPairData[]>()
  const [priceRates, setPriceRates] = useState<PriceRateProps[]>()
  const [slippage, setSlippage] = useState<number>(0.03)
  const [allowedSwapFromTokens, setAllowedSwapFromTokens] = useState<BottomSheetToken[]>()
  const [allowedSwapToTokens, setAllowedSwapToTokens] = useState<BottomSheetToken[]>()
  const [allTokens, setAllTokens] = useState<TokenProps[]>()

  const bottomSheetRef = useRef<BottomSheetModal>(null)
  const expandModal = useCallback(() => {
    bottomSheetRef.current?.present()
  }, [])
  const dismissModal = useCallback(() => {
    bottomSheetRef.current?.close()
  }, [])

  // component UI state
  const { control, formState, setValue, trigger, watch } = useForm<{
    tokenA: string
    tokenB: string
  }>({ mode: 'onChange' })
  const { tokenA, tokenB } = watch()
  const tokenAFormAmount = tokenA === '' ? undefined : tokenA
  const tokenBFormAmount = tokenB === '' ? undefined : tokenB
  const { isConversionRequired, conversionAmount } = useConversion({
    inputToken: {
      type: selectedTokenA?.id === '0_unified' ? 'token' : 'others',
      amount: new BigNumber(tokenA)
    },
    deps: [tokenA, JSON.stringify(tokens)]
  })

  const getMaxAmount = (token: DerivedTokenState): string => {
    if (token.id !== '0_unified') {
      return new BigNumber(token.amount).toFixed(8)
    }

    const maxAmount = new BigNumber(token.amount).minus(reservedDfi)
    return maxAmount.isLessThanOrEqualTo(0) ? new BigNumber(0).toFixed(8) : maxAmount.toFixed(8)
  }

  const onTokenSelect = ({ direction }: {direction: 'FROM' | 'TO'}): void => {
    setBottomSheetScreen([
      {
        stackScreenName: 'TokenList',
        component: BottomSheetTokenList({
          tokensList: direction === 'FROM' ? allowedSwapFromTokens ?? [] : allowedSwapToTokens ?? [],
          headerLabel: translate('screens/CompositeSwapScreen', 'Choose a token for swap'),
          onCloseButtonPress: () => bottomSheetRef.current?.close(),
          onTokenPress: (item): void => {
            const tokenId = item.id === '0_unified' ? '0' : item.id
            const selectedToken = allTokens?.find(token => token.id === tokenId)
            const ownedToken = tokens?.find(token => token.id === item.id)
            if (selectedToken == null) {
              dismissModal()
              return
            }

            const mappedData: DerivedTokenState = {
              id: ownedToken !== undefined ? ownedToken.id : selectedToken.id,
              symbol: selectedToken.symbol,
              displaySymbol: selectedToken.displaySymbol,
              amount: ownedToken !== undefined ? ownedToken.amount : ''
            }

            direction === 'FROM' ? setSelectedTokenA(mappedData) : setSelectedTokenB(mappedData)
            direction === 'FROM' && selectedTokenB !== undefined && setSelectedTokenB(undefined)
            dismissModal()
          }
        }),
        option: {
          header: () => null
        }
      }])
    expandModal()
  }

  useEffect(() => {
    client.fee.estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(logger.error)
  }, [])

  useEffect(() => {
    if (pairs !== undefined) {
      const tokens = pairs.reduce((tokensInPair: TokenProps[], pair: DexItem): TokenProps[] => {
        const hasTokenA = tokensInPair.some(token => pair.data.tokenA.id === token.id)
        const hasTokenB = tokensInPair.some(token => pair.data.tokenB.id === token.id)
        const tokensToAdd = []
        if (!hasTokenA) {
          tokensToAdd.push(pair.data.tokenA)
        }
        if (!hasTokenB) {
          tokensToAdd.push(pair.data.tokenB)
        }

        return [...tokensInPair, ...tokensToAdd]
      }, [])

      setAllTokens(tokens)
    }
  }, [pairs])

  useEffect(() => {
    // setOwnedNonLPTokens(tokens.filter(token => token.isLPS === false && !token.id.includes('utxo') && !token.id.includes('unified')))
    const swappableFromTokens = tokens.reduce((swappedTokens: BottomSheetToken[], token): BottomSheetToken[] => {
      if (!token.isLPS && token.id !== '0' && token.id !== '0_utxo') {
        const derivedBottomSheetToken: BottomSheetToken = {
          id: token.id,
          name: token.displaySymbol,
          available: new BigNumber(token.amount)
        }

        return [...swappedTokens, derivedBottomSheetToken]
      }

      return swappedTokens
    }, [])

    setAllowedSwapFromTokens(swappableFromTokens)

    if (selectedTokenA !== undefined && allTokens !== undefined) {
       const swappableToTokens = getAllPossibleSwapToTokens(allTokens, pairs, selectedTokenA.id === '0_unified' ? '0' : selectedTokenA.id)
      setAllowedSwapToTokens(swappableToTokens)
    }
  }, [tokens, selectedTokenA, selectedTokenB])

  useEffect(() => {
    if (selectedTokenA !== undefined && selectedTokenB !== undefined && allTokens !== undefined) {
      const graph: GraphProps[] = pairs.map(pair => {
        const graphItem: GraphProps = {
          pairId: pair.data.id,
          a: pair.data.tokenA.symbol,
          b: pair.data.tokenB.symbol
        }
        return graphItem
      })

      // TODO - Handle cheapest path with N hops, currently this logic find the shortest path
      const path = findPath(graph, selectedTokenA.symbol, selectedTokenB.symbol)
      const poolPairs = path.reduce((poolPairs: PoolPairData[], token, index): PoolPairData[] => {
        const pair = pairs.find(pair => pair.data.tokenA.symbol === token, path[index + 1])
        if ((pair == null) || index === path.length) {
          return poolPairs
        }
        return [
          ...poolPairs,
          {
            id: pair.data.id,
            symbol: pair.data.symbol,
            tokenA: pair.data.tokenA,
            tokenB: pair.data.tokenB,
            priceRatio: pair.data.priceRatio,
            name: pair.data.name,
            totalLiquidity: pair.data.totalLiquidity,
            apr: pair.data.apr,
            commission: pair.data.commission,
            creation: pair.data.creation,
            customRewards: pair.data.customRewards,
            ownerAddress: pair.data.ownerAddress,
            rewardPct: pair.data.rewardPct,
            status: pair.data.status,
            tradeEnabled: pair.data.tradeEnabled
          }]
      }, [])

      setSelectedPoolPairs(poolPairs)
    }
  }, [selectedTokenA, selectedTokenB, allTokens])

  useEffect(() => {
    if (selectedTokenA !== undefined && selectedTokenB !== undefined && selectedPoolPairs !== undefined) {
      const { priceA, priceB } = calculatePriceRates(selectedTokenA, selectedPoolPairs)
      setPriceRates([{
        label: translate('screens/CompositeSwapScreen', '{{tokenA}} price in {{tokenB}}', { tokenA: selectedTokenA.displaySymbol, tokenB: selectedTokenB.displaySymbol }),
        value: `1 ${selectedTokenA.displaySymbol} = ${priceB} ${selectedTokenB.displaySymbol}`
      }, {
        label: translate('screens/CompositeSwapScreen', '{{tokenB}} price in {{tokenA}}', { tokenA: selectedTokenA.displaySymbol, tokenB: selectedTokenB.displaySymbol }),
        value: `1 ${selectedTokenB.displaySymbol} = ${priceA} ${selectedTokenA.displaySymbol}`
      }
      ])

      const estimated = calculateEstimatedAmount(tokenAFormAmount, selectedTokenA, priceA).toFixed(8)
      setValue('tokenB', estimated)
    }
  }, [selectedPoolPairs, tokenAFormAmount])

  const onSubmit = async (): Promise<void> => {
    if (hasPendingJob || hasPendingBroadcastJob) {
      return
    }
    if (selectedPoolPairs === undefined || selectedTokenA === undefined || selectedTokenB === undefined || priceRates === undefined || tokenAFormAmount === undefined || tokenBFormAmount === undefined) {
      return
    }

    navigation.navigate('ConfirmCompositeSwapScreen', {
      fee,
      pairs: selectedPoolPairs,
      priceRates,
      slippage,
      swap: {
        tokenTo: selectedTokenB,
        tokenFrom: selectedTokenA,
        amountFrom: new BigNumber(tokenAFormAmount),
        amountTo: new BigNumber(tokenBFormAmount)
      },
      tokenA: selectedTokenA,
      tokenB: selectedTokenB,
      ...(isConversionRequired && {
        conversion: {
          isConversionRequired,
          DFIToken,
          DFIUtxo,
          conversionAmount
        }
      })
    })
  }

  return (
    <ThemedScrollView>
      <ThemedText
        dark={tailwind('text-gray-50')}
        light={tailwind('text-gray-900')}
        style={tailwind('text-xl font-semibold m-4 mb-0')}
      >
        {translate('screens/CompositeSwapScreen', 'Swap tokens')}
      </ThemedText>

      <View style={tailwind('flex flex-row mt-3 mx-2')}>
        <TokenSelection label='FROM' symbol={selectedTokenA?.displaySymbol} onPress={() => onTokenSelect({ direction: 'FROM' })} />
        <TokenSelection label='TO' symbol={selectedTokenB?.displaySymbol} onPress={() => onTokenSelect({ direction: 'TO' })} />
      </View>

      {(selectedTokenA === undefined || selectedTokenB === undefined) &&
        <ThemedText
          dark={tailwind('text-gray-400')}
          light={tailwind('text-gray-500')}
          style={tailwind('mt-10 text-center')}
        > {translate('screens/CompositeSwapScreen', 'Select tokens you want to swap to get started')}
        </ThemedText>}

      {selectedTokenA !== undefined && selectedTokenB !== undefined &&
        <View style={tailwind('mt-10 mx-4')}>
          <TokenRow
            control={control}
            controlName='tokenA'
            isDisabled={false}
            title={translate('screens/CompositeSwapScreen', 'How much {{token}} do you want to swap?', { token: selectedTokenA.displaySymbol })}
            maxAmount={getMaxAmount(selectedTokenA)}
            enableMaxButton
            onChangeFromAmount={async (amount) => {
              amount = isNaN(+amount) ? '0' : amount
              setValue('tokenA', amount)
              await trigger('tokenA')
            }}
            token={selectedTokenA}
          />
          <InputHelperText
            testID='text_balance_amount'
            label={`${translate('screens/CompositeSwapScreen', 'You have')} `}
            content={getMaxAmount(selectedTokenA)}
            suffix={` ${selectedTokenA.displaySymbol}`}
          />
          <View style={tailwind(['mt-4', { 'mb-4': isConversionRequired }])}>
            <TokenRow
              control={control}
              controlName='tokenB'
              isDisabled
              title={translate('screens/CompositeSwapScreen', 'Estimated to receive')}
              token={selectedTokenB}
              enableMaxButton={false}
            />
          </View>
          {isConversionRequired && <ConversionInfoText />}
          <SlippageTolerance setSlippage={(amount) => setSlippage(amount)} slippage={slippage} />
        </View>}

      {(selectedTokenB !== undefined && selectedTokenA !== undefined && priceRates !== undefined && tokenAFormAmount !== undefined && tokenBFormAmount !== undefined) &&
        <>
          <PricesSection priceRates={priceRates} sectionTitle='PRICES' />
          <TransactionDetailsSection
            conversionAmount={conversionAmount}
            estimatedAmount={tokenBFormAmount}
            fee={fee}
            isConversionRequired={isConversionRequired}
            slippage={slippage}
            tokenA={selectedTokenA}
            tokenB={selectedTokenB}
          />
        </>}

      {selectedTokenA !== undefined && selectedTokenB !== undefined && (
        <Button
          disabled={!formState.isValid || hasPendingJob || hasPendingBroadcastJob}
          label={translate('screens/CompositeSwapScreen', 'CONTINUE')}
          onPress={onSubmit}
          testID='button_submit'
          title='CONTINUE'
          margin='mx-4 mb-2 mt-8'
        />)}

      {formState.isValid && selectedTokenA !== undefined && selectedTokenB !== undefined &&
        <ThemedText
          testID='transaction_details_hint_text'
          light={tailwind('text-gray-600')}
          dark={tailwind('text-gray-300')}
          style={tailwind('pb-8 px-4 text-sm text-center')}
        >
          {isConversionRequired
            ? translate('screens/CompositeSwapScreen', 'Authorize transaction in the next screen to convert')
            : translate('screens/CompositeSwapScreen', 'Review and confirm transaction in the next screen')}
        </ThemedText>}

      <BottomSheetWithNav
        modalRef={bottomSheetRef}
        screenList={bottomSheetScreen}
      />

    </ThemedScrollView>
)
}

function TokenSelection (props: {symbol?: string, label: string, onPress: () => void}): JSX.Element {
  const Icon = getNativeIcon(props.symbol ?? '')

  return (
    <View style={[tailwind('flex-grow mx-2'), { flexBasis: 0 }]}>
      <ThemedText
        dark={tailwind('text-gray-400')}
        light={tailwind('text-gray-500')}
        style={tailwind('text-xs pb-1')}
      >{props.label}
      </ThemedText>
      <ThemedTouchableOpacity
        onPress={props.onPress}
        testID={`token_select_button_${props.label}`}
        dark={tailwind('bg-gray-800 border-gray-400')}
        light={tailwind('bg-white border-gray-300')}
        style={tailwind('flex flex-row items-center border rounded p-2')}
      >
        {props.symbol === undefined &&
          <ThemedText
            dark={tailwind('text-gray-400')}
            light={tailwind('text-gray-500')}
            style={tailwind('text-sm leading-6')}
          >
            {translate('screens/CompositeSwapScreen', 'Select token')}
          </ThemedText>}

        {props.symbol !== undefined &&
          <>
            <Icon testID='tokenA_icon' height={17} width={17} />
            <ThemedText style={tailwind('text-gray-500 ml-2')}>{props.symbol}</ThemedText>
          </>}

        <ThemedIcon
          iconType='MaterialIcons'
          name='unfold-more'
          size={20}
          dark={tailwind('text-darkprimary-500')}
          light={tailwind('text-primary-500')}
          style={[tailwind('text-center mt-0.5'), { marginLeft: 'auto' }]}
        />
      </ThemedTouchableOpacity>
    </View>
  )
}

function TransactionDetailsSection ({ conversionAmount, estimatedAmount, fee, isConversionRequired, slippage, tokenA, tokenB }: {conversionAmount: BigNumber, estimatedAmount: string, fee: BigNumber, isConversionRequired: boolean, slippage: number, tokenA: DerivedTokenState, tokenB: DerivedTokenState}): JSX.Element {
  return (
    <>
      <ThemedSectionTitle
        testID='title_add_detail'
        text={translate('screens/CompositeSwapScreen', 'TRANSACTION DETAILS')}
        style={tailwind('px-4 pt-6 pb-2 text-xs text-gray-500 font-medium')}
      />
      {isConversionRequired &&
        <NumberRow
          lhs={translate('screens/CompositeSwapScreen', 'Amount to be converted')}
          rhs={{
          testID: 'amount_to_convert',
          value: conversionAmount.toFixed(8),
          suffixType: 'text',
          suffix: tokenA.displaySymbol
        }}
        />}
      <TextRow
        lhs={translate('screens/CompositeSwapScreen', 'Estimated to receive')}
        rhs={{
          value: `${estimatedAmount} ${tokenB.displaySymbol}`,
          testID: 'estimated_to_receive'
        }}
        textStyle={tailwind('text-sm font-normal')}
      />
      <TextRow
        lhs='Slippage Tolerance'
        rhs={{
          value: `${new BigNumber(slippage).times(100).toFixed(2)}%`,
          testID: 'slippage_tolerance'
        }}
        textStyle={tailwind('text-sm font-normal')}
      />
      <FeeInfoRow
        type='ESTIMATED_FEE'
        value={fee.toFixed(8)}
        testID='text_fee'
        suffix='DFI'
      />
    </>
  )
}

function calculatePriceRates (tokenA: DerivedTokenState, pairs: PoolPairData[]): { priceA: string, priceB: string } {
  let lastTokenBId = tokenA.id
  const priceRates = pairs.reduce((priceRates, pair): {priceA: BigNumber, priceB: BigNumber} => {
    const [reserveA, reserveB] = pair.tokenA.id !== lastTokenBId ? [pair.tokenA.reserve, pair.tokenB.reserve] : [pair.tokenB.reserve, pair.tokenA.reserve]
    const priceRateA = new BigNumber(reserveA).div(reserveB)
    const priceRateB = new BigNumber(reserveB).div(reserveA)

    // To sequentially convert the token from its last token
    lastTokenBId = pair.tokenA.id === lastTokenBId ? pair.tokenB.id : pair.tokenA.id

    return {
      priceA: priceRates.priceA.times(priceRateA),
      priceB: priceRates.priceB.times(priceRateB)
    }
  }, {
    priceA: new BigNumber(1),
    priceB: new BigNumber(1)
  })

  return {
    priceA: priceRates.priceA.toFixed(8),
    priceB: priceRates.priceB.toFixed(8)
  }
}

function calculateEstimatedAmount (tokenAAmount: string | undefined, selectedTokenA: DerivedTokenState, priceA: string): BigNumber {
  // TODO: Add logic to determine the slippage
  // const slippage = (new BigNumber(1).minus(new BigNumber(tokenAAmount).div(reserveA)))
  return new BigNumber(tokenAAmount ?? 0).times(priceA)// .times(slippage)
}

interface TokenForm {
  control: Control<{tokenA: string, tokenB: string}>
  controlName: 'tokenA' | 'tokenB'
  token: DerivedTokenState
  enableMaxButton: boolean
  maxAmount?: string
  onChangeFromAmount?: (amount: string) => void
  title: string
  isDisabled: boolean
}

function TokenRow (form: TokenForm): JSX.Element {
  const {
    token,
    control,
    onChangeFromAmount,
    title,
    controlName,
    enableMaxButton,
    isDisabled,
    maxAmount
  } = form
  const Icon = getNativeIcon(token.displaySymbol)
  const rules: { required: boolean, pattern: RegExp, validate: any, max?: string } = {
    required: true,
    max: maxAmount,
    pattern: /^\d*\.?\d*$/,
    validate: {
      greaterThanZero: (value: string) => new BigNumber(value !== undefined && value !== '' ? value : 0).isGreaterThan(0)
    }
  }
  const defaultValue = ''

  return (
    <Controller
      control={control}
      defaultValue={defaultValue}
      name={controlName}
      render={({ field: { onChange, value } }) => (
        <ThemedView
          dark={tailwind('bg-transparent')}
          light={tailwind('bg-transparent')}
          style={tailwind('flex-row w-full')}
        >
          <WalletTextInput
            autoCapitalize='none'
            editable={!isDisabled}
            onChange={(e) => {
              if (!isDisabled) {
                if (onChangeFromAmount !== undefined) {
                  onChangeFromAmount(e.nativeEvent.text)
                } else {
                  onChange(e)
                }
              }
            }}
            placeholder={isDisabled ? undefined : translate('screens/CompositeSwapScreen', 'Enter an amount')}
            style={tailwind('flex-grow w-2/5')}
            testID={`text_input_${controlName}`}
            value={value}
            displayClearButton={(value !== defaultValue) && !isDisabled}
            onClearButtonPress={() => onChangeFromAmount?.(defaultValue)}
            title={title}
            inputType='numeric'
          >
            {
              (enableMaxButton && onChangeFromAmount !== undefined) && (
                <>
                  <SetAmountButton
                    amount={new BigNumber(maxAmount ?? '0')}
                    onPress={onChangeFromAmount}
                    type={AmountButtonTypes.half}
                  />

                  <SetAmountButton
                    amount={new BigNumber(maxAmount ?? '0')}
                    onPress={onChangeFromAmount}
                    type={AmountButtonTypes.max}
                  />
                </>
              )
            }
            {
              !enableMaxButton && (
                <>
                  <Icon height={20} width={20} />
                  <ThemedText style={tailwind('pl-2')}>
                    {token.displaySymbol}
                  </ThemedText>
                </>
              )
            }
          </WalletTextInput>
        </ThemedView>
      )}
      rules={rules}
    />
  )
}

interface TokenProps {
  id: string
  symbol: string
  displaySymbol: string
  reserve: string
  blockCommission: string
}

/**
 * This function finds all the possible paths of an undirected graph in the context of tokens and pairs
 * @param tokens
 * @param pairs
 * @param tokenFrom
 */
function getAllPossibleSwapToTokens (allTokens: TokenProps[], pairs: DexItem[], tokenFrom: string): BottomSheetToken[] {
  const graph: GraphProps[] = pairs.map(pair => {
    const graphItem: GraphProps = {
      pairId: pair.data.id,
      a: pair.data.tokenA.id,
      b: pair.data.tokenB.id
    }
    return graphItem
  })

  const reachableNodes = []
  const reachableNodeIds = new Set<string>([])
  // Use Sets to reduce checks if item is unique
  const visitedNodes = new Set<string>([])
  const nodesToVisit = new Set<string>([tokenFrom])

  while (nodesToVisit.size !== 0) {
    const [token] = nodesToVisit // first item in a set
    const adjacentNodes = getAdjacentVertices(tokenFrom, graph)

    if (adjacentNodes !== undefined) {
      adjacentNodes.forEach(node => {
        if (!reachableNodeIds.has(node)) {
          reachableNodes.push(node)
        }

        // If the token hasn't been visited, flag for visit.
        if (!visitedNodes.has(node)) {
          nodesToVisit.add(node)
        }
        reachableNodeIds.add(node)
      })
    }

    visitedNodes.add(token)
    nodesToVisit.delete(token)
  }

  const reachableTokens: BottomSheetToken[] = reachableNodes.reduce((tokens: BottomSheetToken[], node: string): BottomSheetToken[] => {
    const token = allTokens.find(token => token.id === node)
    if (token !== undefined && node !== tokenFrom) {
      return [
        ...tokens, {
          id: token.id,
          name: token.displaySymbol,
          available: new BigNumber(token.reserve)
        }
      ]
    }

    return tokens
  }, [])

  return reachableTokens
}

interface GraphProps { pairId: string, a: string, b: string }
/**
 * To find all the adjacent vertices / neighbors of a node in a graph
 * @param startNode
 * @param graph
 */
function getAdjacentVertices (startNode: string, graph: GraphProps[]): string[] {
  return (
    graph.reduce((vertices: string[], vertex): string[] => {
      if (vertex.a === startNode && vertex.b !== startNode) {
        return [...vertices, vertex.b]
      } else if (vertex.b === startNode && vertex.a !== startNode) {
        return [...vertices, vertex.a]
      }

      return vertices
    }, [])
  )
}

/**
 * This uses a modified Breadth First Search to find the first path found (by distance)
 * @param graph
 * @param start
 * @param target
 */
function findPath (graph: GraphProps[], origin: string, target: string): string[] {
  let isPathFound = false
  let nodesToVisit = [origin]
  const visitedNodes = new Set<string>([]) // track visited nodes in a set
  let currentDistance = 0 // track distance from origin to target
  const path: string[] = [] // store the first path found by token

  bfs({
    start: {
      value: origin,
      edges: getAdjacentVertices(origin, graph)
    },
    target: target
  })

  function bfs ({ start, target }: { start: { value: string, edges: string[]}, target: string}): void {
    if (!isPathFound && (start.edges.length !== 0 || start.value === target)) { // not yet a dead-end
      path[currentDistance] = start.value // store possible path to to target
    }

    if (start.value === target) {
      isPathFound = true
    }

    visitedNodes.add(start.value)

    while (nodesToVisit.length > 0) {
      currentDistance = currentDistance + 1
      nodesToVisit.shift()
      const nextNodeToVisitEdges = start.edges

      for (let i = 0; i < nextNodeToVisitEdges.length; i++) {
        const startValue = nextNodeToVisitEdges[i]
        const innerStart = {
          value: startValue,
          edges: getAdjacentVertices(startValue, graph).filter(vertex => !visitedNodes.has(vertex))
        }
        const startEdgesToVisit = innerStart.edges

        nodesToVisit = [...nodesToVisit, ...startEdgesToVisit]
        bfs({
          start: innerStart,
          target: target
        })
      }
    }
  }

  return isPathFound ? path : []
}
