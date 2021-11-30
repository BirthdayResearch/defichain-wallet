import { StyleProp, ViewStyle } from 'react-native'
import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { MaterialIcons } from '@expo/vector-icons'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import { useEffect, useState } from 'react'
import NumberFormat from 'react-number-format'
import { useSelector } from 'react-redux'
import { View } from '@components'
import { IconButton } from '@components/IconButton'
import { getNativeIcon } from '@components/icons/assets'
import { SkeletonLoader, SkeletonLoaderScreen } from '@components/SkeletonLoader'
import { ThemedFlatList, ThemedIcon, ThemedText, ThemedView } from '@components/themed'
import { usePoolPairsAPI } from '@hooks/wallet/PoolPairsAPI'
import { useTokensAPI } from '@hooks/wallet/TokensAPI'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { DexParamList } from './DexNavigator'
import { DisplayDexGuidelinesPersistence } from '@api'
import { DexGuidelines } from './DexGuidelines'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { Tabs } from '@components/Tabs'
import { WalletToken } from '@store/wallet'
import { RootState } from '@store'

enum TabKey {
  YourPoolPair = 'YOUR_POOL_PAIRS',
  AvailablePoolPair = 'AVAILABLE_POOL_PAIRS'
}

export function DexScreen (): JSX.Element {
  const logger = useLogger()
  const navigation = useNavigation<NavigationProp<DexParamList>>()
  const [activeTab, setActiveTab] = useState<string>(TabKey.AvailablePoolPair)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  const [displayGuidelines, setDisplayGuidelines] = useState<boolean>(true)
  const tokens = useTokensAPI()
  const pairs = usePoolPairsAPI()
  const yourLPTokens = useSelector(() => tokens.filter(({ isLPS }) => isLPS).map(data => ({
    type: 'your',
    data: data
  })))

  const onTabChange = (tabKey: TabKey): void => {
    setActiveTab(tabKey)
  }

  const tabsList = [{
    id: TabKey.AvailablePoolPair,
    label: translate('screens/DexScreen', 'Browse pool pairs'),
    disabled: false,
    handleOnPress: () => onTabChange(TabKey.AvailablePoolPair)
  }, {
    id: TabKey.YourPoolPair,
    label: translate('screens/DexScreen', 'Your pool pairs'),
    disabled: false,
    handleOnPress: () => onTabChange(TabKey.YourPoolPair)
  }]

  const {
    tvl
  } = useSelector((state: RootState) => state.block)

  const onAdd = (data: PoolPairData): void => {
    navigation.navigate({
      name: 'AddLiquidity',
      params: { pair: data },
      merge: true
    })
  }

  const onRemove = (data: PoolPairData): void => {
    navigation.navigate({
      name: 'RemoveLiquidity',
      params: { pair: data },
      merge: true
    })
  }

  useEffect(() => {
    DisplayDexGuidelinesPersistence.get()
      .then((shouldDisplayGuidelines: boolean) => {
        setDisplayGuidelines(shouldDisplayGuidelines)
      })
      .catch(logger.error)
      .finally(() => setIsLoaded(true))
  }, [])

  const onGuidelinesClose = async (): Promise<void> => {
    await DisplayDexGuidelinesPersistence.set(false)
    setDisplayGuidelines(false)
  }

  if (!isLoaded) {
    return <></>
  }

  if (displayGuidelines) {
    return <DexGuidelines onClose={onGuidelinesClose} />
  }

  return (
    <>
      <ThemedView
        dark={tailwind('bg-gray-800 border-b border-gray-700')}
        light={tailwind('bg-white border-b border-gray-200')}
        style={tailwind('flex flex-row px-4 py-3 justify-between text-center')}
      >
        <View style={tailwind('flex flex-col')}>
          <ThemedText
            light={tailwind('text-gray-500')} dark={tailwind('text-gray-400')}
            style={tailwind('text-xs')}
          >{translate('screens/DexScreen', 'Total Value Locked (USD)')}
          </ThemedText>
          <ThemedText>
            <NumberFormat
              displayType='text'
              prefix='$'
              renderText={(val: string) => (
                <ThemedText
                  dark={tailwind('text-gray-50')}
                  light={tailwind('text-gray-900')}
                  style={tailwind('text-lg text-left font-bold')}
                  testID='DEX_TVL'
                >
                  {val}
                </ThemedText>
              )}
              thousandSeparator
              value={new BigNumber(tvl ?? 0).decimalPlaces(0, BigNumber.ROUND_DOWN).toString()}
            />
          </ThemedText>
        </View>
        <ActionButton
          name='swap-horiz'
          onPress={() => navigation.navigate({
            name: 'CompositeSwap',
            params: {},
            merge: true
          })}
          pair='composite'
          label={translate('screens/DexScreen', 'SWAP')}
          style={tailwind('my-2 p-2')}
          testID='composite_swap'
        />
      </ThemedView>
      <Tabs tabSections={tabsList} testID='dex_tabs' activeTabKey={activeTab} />
      <View style={tailwind('flex-1')}>
        {
          activeTab === TabKey.AvailablePoolPair && pairs.length === 0 && (
            <View style={tailwind('mt-2')}>
              <SkeletonLoader
                row={4}
                screen={SkeletonLoaderScreen.Dex}
              />
            </View>
          )
        }
        {
          activeTab === TabKey.AvailablePoolPair && pairs !== undefined && (
            <AvailablePoolPairCards
              availablePairs={pairs}
              onAdd={onAdd}
            />
          )
        }

        {
          activeTab === TabKey.YourPoolPair && yourLPTokens.length === 0 && (
            <ThemedView
              dark={tailwind('bg-gray-900')}
              light={tailwind('bg-gray-100')}
              style={tailwind('flex items-center justify-center px-14 pb-40 h-full')}
            >
              <ThemedIcon
                iconType='MaterialCommunityIcons'
                name='circle-off-outline'
                size={48}
                style={tailwind('mb-6')}
              />
              <ThemedText
                style={tailwind('text-2xl font-semibold text-center mb-1')}
              >{translate('screens/DexScreen', 'No active pool pairs')}
              </ThemedText>
              <ThemedText
                dark={tailwind('text-gray-400')}
                light={tailwind('text-gray-500')}
                style={tailwind('text-base text-center')}
              >{translate('screens/DexScreen', 'Supply liquidity pool tokens to earn high yields')}
              </ThemedText>
            </ThemedView>
          )
        }
        {
          activeTab === TabKey.YourPoolPair && (
            <YourPoolPairCards
              yourPairs={yourLPTokens}
              availablePairs={pairs}
              onAdd={onAdd}
              onRemove={onRemove}
            />
          )
        }
      </View>
    </>
  )
}

interface DexItem<T> {
  type: 'your' | 'available'
  data: T
}

interface YourPoolPairCardsItems {
  yourPairs: Array<{ type: string, data: WalletToken }>
  availablePairs: Array<DexItem<PoolPairData>>
  onAdd: (data: PoolPairData) => void
  onRemove: (data: PoolPairData) => void
}

function YourPoolPairCards ({
  yourPairs,
  availablePairs,
  onAdd,
  onRemove
}: YourPoolPairCardsItems): JSX.Element {
  return (
    <ThemedFlatList
      data={yourPairs}
      numColumns={1}
      keyExtractor={(_item, index) => index.toString()}
      testID='your_liquidity_tab'
      renderItem={({
        item,
        index
      }: { item: { type: string, data: WalletToken }, index: number }): JSX.Element => {
        const { data: yourPair } = item
        const poolPairData = availablePairs.find(pr => pr.data.symbol === (yourPair as AddressToken).symbol)
        const mappedPair = poolPairData?.data

        const [symbolA, symbolB] = (mappedPair?.tokenA != null && mappedPair?.tokenB != null)
          ? [mappedPair.tokenA.displaySymbol, mappedPair.tokenB.displaySymbol]
          : yourPair.symbol.split('-')
        const toRemove = new BigNumber(1).times(yourPair.amount).decimalPlaces(8, BigNumber.ROUND_DOWN)
        const ratioToTotal = toRemove.div(mappedPair?.totalLiquidity?.token ?? 1)
        const symbol = `${symbolA}-${symbolB}`

        // assume defid will trim the dust values too
        const tokenATotal = ratioToTotal.times(mappedPair?.tokenA.reserve ?? 0).decimalPlaces(8, BigNumber.ROUND_DOWN)
        const tokenBTotal = ratioToTotal.times(mappedPair?.tokenB.reserve ?? 0).decimalPlaces(8, BigNumber.ROUND_DOWN)

        return (
          <ThemedView
            dark={tailwind('bg-gray-800 border-gray-700')}
            light={tailwind('bg-white border-gray-200')}
            style={tailwind('mx-4 p-4 my-1 border rounded', { 'mt-4': index === 0 })}
            testID='pool_pair_row_your'
          >
            <View style={tailwind('flex-row items-center justify-between')}>
              <View style={tailwind('flex-row items-center')}>
                <PoolPairIcon symbolA={symbolA} symbolB={symbolB} />
                <ThemedText
                  style={tailwind('text-base font-medium')}
                  testID={`your_symbol_${symbol}`}
                >
                  {symbol}
                </ThemedText>
              </View>
            </View>
            <PoolPairInfoDetails
              type='your'
              pair={mappedPair}
              pairAmount={yourPair.amount}
              tokenATotal={tokenATotal.toFixed(8)}
              tokenBTotal={tokenBTotal.toFixed(8)}
              testID='your'
            />
            <PoolPairActions
              onAdd={() => onAdd((poolPairData as DexItem<PoolPairData>)?.data)}
              onRemove={() => onRemove((poolPairData as DexItem<PoolPairData>)?.data)}
              symbol={symbol}
            />
          </ThemedView>
        )
      }}
    />
  )
}

function AvailablePoolPairCards ({
  availablePairs,
  onAdd
}: { availablePairs: Array<DexItem<PoolPairData>>, onAdd: (data: PoolPairData) => void }): JSX.Element {
  const navigation = useNavigation<NavigationProp<DexParamList>>()
  return (
    <ThemedFlatList
      data={availablePairs}
      numColumns={1}
      keyExtractor={(_item, index) => index.toString()}
      testID='available_liquidity_tab'
      renderItem={({
        item,
        index
      }: { item: DexItem<PoolPairData>, index: number }): JSX.Element => {
        const { data: pair } = item
        const [symbolA, symbolB] = (pair?.tokenA != null && pair?.tokenB != null)
          ? [pair.tokenA.displaySymbol, pair.tokenB.displaySymbol]
          : pair.symbol.split('-')
        const symbol = `${symbolA}-${symbolB}`

        return (
          <ThemedView
            dark={tailwind('bg-gray-800 border-gray-700')}
            light={tailwind('bg-white border-gray-200')}
            style={tailwind('mx-4 p-4 my-1 border rounded', { 'mt-4': index === 0 })}
            testID='pool_pair_row'
          >
            <View style={tailwind('flex-row items-center')}>
              <PoolPairIcon symbolA={symbolA} symbolB={symbolB} />
              <ThemedText
                style={tailwind('text-base font-medium')}
                testID={`your_symbol_${symbol}`}
              >
                {symbol}
              </ThemedText>
            </View>

            <PoolPairInfoDetails
              type='available' pair={pair} tokenATotal={pair?.tokenA.reserve}
              tokenBTotal={pair?.tokenB.reserve} testID='available'
            />

            <View style={tailwind('flex-row mt-4 flex-wrap')}>
              <ActionButton
                name='add'
                onPress={() => onAdd(pair)}
                pair={symbol}
                label={translate('screens/DexScreen', 'ADD LIQUIDITY')}
                style={tailwind('mr-2 mt-2')}
                testID={`pool_pair_add_${symbol}`}
              />
              <ActionButton
                name='swap-horiz'
                onPress={() => navigation.navigate({
                  name: 'CompositeSwap',
                  params: { pair },
                  merge: true
                })}
                pair={symbol}
                label={translate('screens/DexScreen', 'SWAP TOKENS')}
                disabled={!pair.tradeEnabled || !pair.status}
                style={tailwind('mr-2 mt-2')}
                testID={`pool_pair_swap-horiz_${symbol}`}
              />
            </View>
          </ThemedView>
        )
      }}
    />
  )
}

function PoolPairInfoDetails (props: { type: 'available' | 'your', pairAmount?: string, pair: PoolPairData | undefined, tokenATotal: string, tokenBTotal: string, testID: string }): JSX.Element {
  const {
    type,
    pair,
    pairAmount,
    tokenATotal,
    tokenBTotal
  } = props
  const pairSymbol = (pair?.tokenA.displaySymbol !== undefined && pair?.tokenB.displaySymbol !== undefined) ? `${pair?.tokenA?.displaySymbol}-${pair?.tokenB?.displaySymbol}` : ''
  const decimalScale = type === 'available' ? 2 : 8

  return (
    <View style={tailwind('mt-1 -mb-1 flex flex-row flex-wrap')}>
      {
        pair !== undefined && (
          <>
            {
              type === 'your' && pairAmount !== undefined && (
                <PoolPairInfoLine
                  label={translate('screens/DexScreen', 'Pooled {{symbol}}', { symbol: pairSymbol })}
                  value={{
                    text: pairAmount,
                    decimalScale: 8,
                    testID: `your_${pairSymbol}`
                  }}
                />
              )
            }
            <PoolPairInfoLine
              label={translate('screens/DexScreen', `${type === 'available' ? 'Pooled' : 'Your pooled'} {{symbol}}`, { symbol: pair?.tokenA?.displaySymbol })}
              value={{
                text: tokenATotal,
                decimalScale: decimalScale,
                testID: `${props.testID}_${pair?.tokenA?.displaySymbol}`
              }}
            />
            <PoolPairInfoLine
              label={translate('screens/DexScreen', `${type === 'available' ? 'Pooled' : 'Your pooled'} {{symbol}}`, { symbol: pair?.tokenB?.displaySymbol })}
              value={{
                text: tokenBTotal,
                decimalScale: decimalScale,
                testID: `${props.testID}_${pair?.tokenB?.displaySymbol}`
              }}
            />
            {
              pair.totalLiquidity.usd !== undefined && (
                <PoolPairInfoLine
                  label={translate('screens/DexScreen', 'Total liquidity (USD)')}
                  value={{
                    text: pair.totalLiquidity.usd,
                    decimalScale: 2,
                    testID: `totalLiquidity_${pairSymbol}`
                  }}
                />)
            }
            {
              pair.apr?.total !== undefined &&
                <PoolPairInfoLine
                  label={translate('screens/DexScreen', 'APR')}
                  value={{
                  text: new BigNumber(isNaN(pair.apr.total) ? 0 : pair.apr.total).times(100).toFixed(2),
                  decimalScale: 2,
                  testID: `apr_${pairSymbol}`,
                  suffix: '%'
                }}
                />
            }
          </>
        )
      }
    </View>
  )
}

interface PoolPairInfoLineProps {
  label: string
  value: {
    decimalScale: number
    suffix?: string
    testID: string
    text: string
  }
}

function PoolPairInfoLine (props: PoolPairInfoLineProps): JSX.Element {
  return (
    <View style={[tailwind('flex-col justify-between mt-3'), { width: '50%' }]}>
      <ThemedText
        dark={tailwind('text-gray-400')}
        light={tailwind('text-gray-500')}
        style={tailwind('text-xs font-normal')}
      >
        {props.label}
      </ThemedText>
      <NumberFormat
        decimalScale={props.value.decimalScale}
        displayType='text'
        renderText={value => (
          <ThemedText
            style={tailwind('text-sm')}
            testID={props.value.testID}
          >
            {value}
          </ThemedText>
        )}
        thousandSeparator
        suffix={props.value.suffix}
        value={props.value.text}
      />
    </View>
  )
}

function PoolPairActions (props: { onAdd: () => void, onRemove: () => void, symbol: string }): JSX.Element {
  const {
    onAdd,
    onRemove,
    symbol
  } = props
  return (
    <View style={tailwind('flex-row mt-3 flex-wrap -mr-2')}>
      <ActionButton
        name='add'
        onPress={onAdd}
        pair={symbol}
        label={translate('screens/DexScreen', 'ADD MORE')}
        style={tailwind('mr-2 mt-2')}
        testID={`pool_pair_add_${symbol}`}
      />

      <ActionButton
        name='remove'
        onPress={onRemove}
        pair={symbol}
        label={translate('screens/DexScreen', 'REMOVE')}
        style={tailwind('mr-2 mt-2')}
        testID={`pool_pair_remove_${symbol}`}
      />
    </View>
  )
}

function ActionButton (props: { name: React.ComponentProps<typeof MaterialIcons>['name'], pair: string, onPress: () => void, label: string, style?: StyleProp<ViewStyle>, disabled?: boolean, testID: string }): JSX.Element {
  return (
    <IconButton
      iconName={props.name}
      iconSize={16}
      iconType='MaterialIcons'
      onPress={props.onPress}
      style={props.style}
      testID={props.testID}
      iconLabel={props.label}
      disabled={props.disabled}
    />
  )
}

function PoolPairIcon (props: { symbolA: string, symbolB: string }): JSX.Element {
  const IconA = getNativeIcon(props.symbolA)
  const IconB = getNativeIcon(props.symbolB)

  return (
    <>
      <IconA
        height={24}
        width={24}
        style={tailwind('relative z-10 -mt-3')}
      />

      <IconB
        height={24}
        width={24}
        style={tailwind('-ml-3 mt-3 mr-3')}
      />
    </>
  )
}
